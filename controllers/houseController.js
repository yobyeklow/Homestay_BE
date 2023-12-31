import mongoose from "mongoose";
import Booking from "../model/booking.js";
import Calendar from "../model/calendar.js";
import FacilitiesDetail from "../model/facilitiesDetails.js";
import FacilitiesType from "../model/facilitiesType.js";
import Host from "../model/host.js";
import House from "../model/house.js";
import Location from "../model/location.js";
import Rating from "../model/rating.js";
import Room from "../model/room.js";
import removeDiacritics from "../utils/removeDiacritics.js";
import { ObjectId } from "mongodb";

function checkFacilitiesInFacilityTypeID(facilities, facilityTypeID) {
  const results = facilities.map((facility) => {
    const found = facilityTypeID.some(
      (type) => type.name === facility.facilityType
    );
    return found;
  });

  return results;
}

const houseController = {
  postHouseStay: async (req, res) => {
    try {
      const { house, location, calendar, rooms, facilities } = req.body;
      const { customerID } = req.params;
      // Check for required fields
      if (!house || !location || !calendar || !facilities || !rooms) {
        return res.status(400).json({ msg: "Vui lòng cung cấp đủ thông tin" });
      }

      // Check dateFrom and dateTo
      const dateFrom = new Date(calendar.dateFrom);
      const dateTo = new Date(calendar.dateTo);
      if (dateFrom > dateTo)
        res
          .status(404)
          .json({ msg: "Ngày nhận phòng và trả phòng không hợp lệ" });

      const existingHost = await Host.findOne({ customerID: customerID });
      // Create the House document
      const createHouse = await House.create({
        hostID: existingHost._id,
        numberGuest: house.numberGuest,
        title: house.title,
        description: house.description,
        costPerNight: house.costPerNight,
        images: house.images,
        bedCount: house.bedCount || 1,
      });

      // Create the Calendar document
      const createCalendar = await Calendar.create({
        houseID: createHouse._id,
        dateFrom: calendar.dateFrom,
        dateTo: calendar.dateTo,
      });

      // Create the Location document
      const createLocation = await Location.create({
        houseID: createHouse._id,
        streetAddress: location.streetAddress,
        city: location.city,
        zipCode: location.zipCode,
        coordinates: {
          x: location.coordinate.x,
          y: location.coordinate.y,
        },
      });

      // Create Room documents and get their IDs
      const roomIDs = await Promise.all(
        rooms.map(async (room) => {
          const result = await Room.create({
            name: room.name,
            type: room.type,
            count: room.count,
            houseID: createHouse._id,
          });
          return result._id;
        })
      );

      // Create FacilitiesType and FacilitiesDetail documents and get their IDs
      const facilitiesIDs = await Promise.all(
        facilities.map(async (facility) => {
          const facilityType = await FacilitiesType.create({
            houseID: createHouse._id,
            name: facility.facilityType,
          });

          const facilityDetailIDs = await Promise.all(
            facility.facilityDetails.map(async (detail) => {
              const result = await FacilitiesDetail.create({
                facilityName: detail.facilityName,
                amount: detail.amount,
                facilityTypeID: facilityType._id,
              });
              return result._id;
            })
          );

          await FacilitiesType.findOneAndUpdate(
            { _id: facilityType._id },
            {
              $push: { facilitiesDetail: { $each: facilityDetailIDs } },
            }
          );

          return facilityType._id;
        })
      );

      // Update the House document with room and facility IDs
      await House.findOneAndUpdate(
        { _id: createHouse._id },
        {
          $set: {
            roomID: roomIDs,
            facilityTypeID: facilitiesIDs,
            calenderID: createCalendar._id,
            locationID: createLocation._id,
          },
        }
      );

      res.status(200).json({ msg: "Tạo housestay thành công" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  updateHouseStay: async (req, res) => {
    try {
      const { houseID } = req.params;
      const { house, location, calendar, rooms, facilities } = req.body;

      if (calendar) {
        const dateFrom = new Date(calendar.dateFrom);
        const dateTo = new Date(calendar.dateTo);
        if (dateFrom > dateTo) {
          return res
            .status(400)
            .json({ msg: "Ngày nhận phòng và trả phòng không hợp lệ" });
        }
      }

      const existingHouse = await House.findOne({ _id: houseID });
      if (!existingHouse) {
        return res.status(404).json({ msg: "Housestay đã bị xóa" });
      }

      if (house) {
        const updatedHouse = {
          numberGuest: house.numberGuest || existingHouse.numberGuest,
          title: house.title || existingHouse.title,
          description: house.description || existingHouse.description,
          costPerNight: house.costPerNight || existingHouse.costPerNight,
          images: house.images || existingHouse.images,
          bedCount: house.bedCount || existingHouse.bedCount,
        };
        await House.findOneAndUpdate({ _id: houseID }, updatedHouse);
      }

      if (location) {
        const existingLocation = await Location.findOne({
          _id: location._id,
          houseID,
        });
        const updatedLocation = {
          streetAddress:
            location?.streetAddress || existingLocation.streetAddress,
          city: location?.city || existingLocation.city,
          zipCode: location?.zipCode || existingLocation.zipCode,
          coordinates: {
            x: location?.coordinates?.x || existingLocation.coordinates.x,
            y: location?.coordinates?.y || existingLocation.coordinates.y,
          },
        };
        await Location.findOneAndUpdate(
          { _id: location._id, houseID },
          updatedLocation
        );
      }

      if (calendar) {
        const existingCalendar = await Calendar.findOne({
          _id: calendar._id,
          houseID,
        });
        const updatedCalendar = {
          available: calendar.available || existingCalendar.available,
          dateFrom: calendar.dateFrom || existingCalendar.dateFrom,
          dateTo: calendar.dateTo || existingCalendar.dateTo,
        };
        await Calendar.findOneAndUpdate(
          { _id: calendar._id, houseID },
          updatedCalendar
        );
      }

      const roomIDs = [];
      if (rooms) {
        for (const room of rooms) {
          if (room._id) {
            const existingRoom = await Room.findOne({ _id: room._id, houseID });
            const updatedRoom = {
              name: room.name || existingRoom.name,
              type: room.type || existingRoom.type,
              count: room.count || existingRoom.count,
            };
            await Room.findOneAndUpdate(
              { _id: room._id, houseID },
              updatedRoom
            );
          } else {
            const newRoom = await Room.create({
              name: room.name,
              type: room.type,
              count: room.count,
              houseID,
            });
            roomIDs.push(newRoom._id);
          }
        }
      }

      const facilitiesIDs = [];
      if (facilities) {
        for (const facility of facilities) {
          if (facility._id) {
            const existingFacility = await FacilitiesType.findOne({
              _id: facility._id,
              houseID,
            });
            const updatedFacility = {
              name: facility.facilityType || existingFacility.name,
            };
            await FacilitiesType.findOneAndUpdate(
              { _id: facility._id, houseID },
              updatedFacility
            );

            for (const detail of facility.facilityDetails) {
              let detailIDs = [];
              if (detail._id) {
                const existingDetail = await FacilitiesDetail.findOne({
                  _id: detail._id,
                });

                const updatedDetail = {
                  facilityName:
                    detail.facilityName || existingDetail.facilityName,
                  amount: detail.amount || existingDetail.amount,
                };
                await FacilitiesDetail.findOneAndUpdate(
                  { _id: detail._id },
                  updatedDetail
                );
              } else {
                const newDetail = await FacilitiesDetail.create({
                  facilityName: detail.facilityName,
                  amount: detail.amount,
                  facilityTypeID: facility._id,
                });
                detailIDs.push(newDetail._id);
              }

              await FacilitiesType.findOneAndUpdate(
                { _id: facility._id },
                {
                  $push: { facilitiesDetail: { $each: detailIDs } },
                }
              );
            }
          } else {
            const newFacilityType = await FacilitiesType.create({
              houseID,
              name: facility.facilityType,
            });

            const facilityDetailIDs = await Promise.all(
              facility.facilityDetails.map(async (detail) => {
                const newDetail = await FacilitiesDetail.create({
                  facilityName: detail.facilityName,
                  amount: detail.amount,
                  facilityTypeID: newFacilityType._id,
                });
                return newDetail._id;
              })
            );

            await FacilitiesType.findOneAndUpdate(
              { _id: newFacilityType._id },
              {
                $push: { facilitiesDetail: { $each: facilityDetailIDs } },
              }
            );

            facilitiesIDs.push(newFacilityType._id);
          }
        }
      }

      await House.findOneAndUpdate(
        { _id: houseID },
        {
          $push: {
            roomID: { $each: roomIDs },
            facilityTypeID: { $each: facilitiesIDs },
          },
        }
      );

      res.status(200).json({ msg: "Cập nhật thành công" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getAllHouseStay: async (req, res) => {
    try {
      let { page, limit } = req.query;
      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 20;
      const skip = (page - 1) * limit;

      const query = House.find()
        .populate("calenderID", "_id available dateFrom dateTo")
        .populate("locationID", "_id city streetAddress coordinates zipCode")
        .populate("roomID", "_id name count type")
        .populate({
          path: "hostID",
          model: "Host",
          select: "_id bankName bankNumber swiftCode nameOnCard",
          populate: {
            path: "customerID",
            model: "Customer",
            select: "_id name photo phoneNumber email",
          },
        })
        .populate("facilityTypeID", "_id name")
        .populate({
          path: "facilityTypeID",
          model: "FacilitiesType",
          select: "_id name",
          populate: {
            path: "facilitiesDetail",
            model: "FacilitiesDetail",
            select: "_id facilityName amount",
          },
        });

      const result = await query.exec();
      const filteredHouses = result.filter(
        (house) => house.calenderID.available === true
      );
      const paginatedHouses = filteredHouses.slice(skip, skip + limit);

      res.status(200).json({
        houses: paginatedHouses,
        houseQuantity: filteredHouses.length,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getAllHouseStayFavorite: async (req, res) => {
    try {
      const { favorites } = req.query;
  
      const housePromises = favorites.map(async (favorite) => {
        const house = await House.aggregate([
          { $match: { _id: new ObjectId(favorite) } },
          { $lookup: { from: "calendars", localField: "_id", foreignField: "houseID", pipeline: [{ $match: { available: true } }, {$project: {_id: 1, available: 1, dateFrom: 1, dateTo: 1}}], as: "calenderID"}},
          { $lookup: { from: "locations", localField: "_id", foreignField: "houseID", pipeline: [{ $project: { _id: 1, city: 1, streetAddress: 1, coordinates: 1, zipCode: 1 } }], as: "locationID"},},
          { $lookup: { from: "rooms", localField: "_id", foreignField: "houseID", pipeline: [{ $project: { _id: 1, name: 1, count: 1, type: 1 } }], as: "roomID"}},
          { $lookup: { from: "hosts", localField: "hostID", foreignField: "_id", pipeline: [{ $lookup: { from: "customers", localField: "customerID",foreignField: "_id",pipeline: [{ $project: { _id: 1, name: 1, photo: 1, phoneNumber: 1, email: 1 } }], as: "customerID"}}, { $project: { _id: 1, customerID: { $arrayElemAt: ["$customerID", 0] }}},], as: "hostID"}},
          { $lookup: { from: "facilitiestypes", localField: "facilityTypeID", foreignField: "_id", pipeline: [{ $lookup: { from: "facilitiesdetails", localField: "facilitiesDetail", foreignField: "_id", pipeline: [{ $project: { _id: 1, facilityName: 1, amount: 1 } }], as: "facilitiesDetail" } }, { $project: { _id: 1, name: 1, facilitiesDetail: 1 } }], as: "facilityTypes",},},
          { $project: { _id: 1, numberGuest: 1, title: 1, description: 1, costPerNight: 1, images: 1, bedCount: 1, calenderID: { $arrayElemAt: ["$calenderID", 0] },locationID: { $arrayElemAt: ["$locationID", 0] }, roomID: 1, hostID: { $arrayElemAt: ["$hostID", 0] }, facilityTypes: "$facilityTypes",},},
        ])

        return house;
      });
  
      const houses = await Promise.all(housePromises);
      const data = [].concat(...houses); 
  
      res.status(200).json({ houses: data });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getAllHouseStayNearLocation: async (req, res) => {
    try {
      const { sw, ne } = req.query;

      const result = await House.find()
        .populate({
          path: "calenderID",
          model: "Calendar",
          select: "_id available dateFrom dateTo",
        })
        .populate({
          path: "locationID",
          model: "Location",
          select: "_id city streetAddress coordinates zipCode",
        })
        .populate({
          path: "roomID",
          model: "Room",
          select: "_id name count type",
        })
        .populate({
          path: "hostID",
          model: "Host",
          select: "_id bankName bankNumber swiftCode nameOnCard",
          populate: {
            path: "customerID",
            model: "Customer",
            select: "_id name photo phoneNumber email",
          },
        })
        .populate({
          path: "facilityTypeID",
          model: "FacilitiesType",
          select: "_id name",
          populate: {
            path: "facilitiesDetail",
            model: "FacilitiesDetail",
            select: "_id facilityName amount",
          },
        })
        .exec();
      const filteredHouses = result.filter((house) => {
        const isNearLocation =
          parseFloat(sw.latitude) <= house.locationID.coordinates.x &&
          house.locationID.coordinates.x <= parseFloat(ne.latitude) &&
          parseFloat(sw.longtitude) <= house.locationID.coordinates.y &&
          house.locationID.coordinates.y <= parseFloat(ne.longtitude);

        const isAvailable = house.calenderID.available === true;

        return isAvailable && isNearLocation;
      });

      res.status(200).json({ houses: filteredHouses });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  filterHouseStay: async (req, res) => {
    try {
      let {
        page = 1,
        limit = 20,
        dateFrom,
        dateTo,
        city,
        numberGuest,
        sw,
        ne,
        bedCount,
        countBedRoom,
        countBathRoom,
        facilities,
        minPrice,
        maxPrice,
      } = req.query;

      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      const query = numberGuest
        ? House.find({ numberGuest: { $gte: numberGuest } })
            .populate("calenderID", "_id available dateFrom dateTo")
            .populate(
              "locationID",
              "_id city streetAddress coordinates zipCode"
            )
            .populate("roomID", "_id name count type")
            .populate({
              path: "hostID",
              model: "Host",
              select: "_id bankName bankNumber swiftCode nameOnCard",
              populate: {
                path: "customerID",
                model: "Customer",
                select: "_id name photo phoneNumber email",
              },
            })
            .populate("facilityTypeID", "_id name")
            .populate({
              path: "facilityTypeID",
              model: "FacilitiesType",
              select: "_id name",
              populate: {
                path: "facilitiesDetail",
                model: "FacilitiesDetail",
                select: "_id facilityName amount",
              },
            })
        : House.find()
            .populate("calenderID", "_id available dateFrom dateTo")
            .populate(
              "locationID",
              "_id city streetAddress coordinates zipCode"
            )
            .populate("roomID", "_id name count type")
            .populate({
              path: "hostID",
              model: "Host",
              select: "_id bankName bankNumber swiftCode nameOnCard",
              populate: {
                path: "customerID",
                model: "Customer",
                select: "_id name photo phoneNumber email",
              },
            })
            .populate("facilityTypeID", "_id name")
            .populate({
              path: "facilityTypeID",
              model: "FacilitiesType",
              select: "_id name",
              populate: {
                path: "facilitiesDetail",
                model: "FacilitiesDetail",
                select: "_id facilityName amount",
              },
            });

      const result = await query.exec();
      const filteredHouses = result.filter((house) => {
        // Check if the city is in the house's city
        let isCity = city
          ? removeDiacritics(city.toLowerCase()).includes(
              removeDiacritics(house.locationID.city.toLowerCase().trim())
            ) ||
            removeDiacritics(
              house.locationID.streetAddress.toLowerCase().trim()
            ).includes(removeDiacritics(city.toLowerCase().trim()))
          : true;

        let isNearLocation =
          sw && ne
            ? parseFloat(sw.latitude) <= house.locationID.coordinates.x &&
              house.locationID.coordinates.x <= parseFloat(ne.latitude) &&
              parseFloat(sw.longtitude) <= house.locationID.coordinates.y &&
              house.locationID.coordinates.y <= parseFloat(ne.longtitude)
            : true;

        let isDateFrom = dateFrom
          ? new Date(dateFrom) >= house.calenderID.dateFrom
          : true;

        let isDateTo = dateTo
          ? new Date(dateTo) <= house.calenderID.dateTo
          : true;

        let isBedCount = bedCount ? bedCount >= house.bedCount : true;
        const isBedRoom = countBedRoom
          ? house.roomID
              .filter((r) => r.type === "phongngu")
              .every((f) => parseInt(f.count) >= parseInt(countBedRoom))
          : true;

        const isBathRoom = countBathRoom
          ? house.roomID
              .filter((r) => r.type === "phongtam")
              .every((f) => parseInt(f.count) >= parseInt(countBathRoom))
          : true;

        let arrayFacilities = [];

        if (facilities) {
          arrayFacilities = checkFacilitiesInFacilityTypeID(
            facilities,
            house.facilityTypeID
          );
        }

        let isFacilities =
          arrayFacilities.length > 0 ? arrayFacilities.includes(true) : true;
        
        let isPrice =
          minPrice && maxPrice
            ? house.costPerNight >= minPrice && house.costPerNight <= maxPrice
            : true;

        return (
          house.calenderID.available === true &&
          isCity &&
          isNearLocation &&
          isDateFrom &&
          isDateTo &&
          isBedCount &&
          isBedRoom &&
          isPrice &&
          isBathRoom &&
          isFacilities
        );
      });

      const paginatedHouses = filteredHouses.slice(skip, skip + limit);

      res.status(200).json({
        houses: paginatedHouses,
        houseQuantity: filteredHouses.length,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getHouseById: async (req, res) => {
    try {
      const { id } = req.params;

      const existingHouse = await House.findOne({ _id: id })
        .populate("calenderID", "_id available dateFrom dateTo")
        .populate("locationID", "_id city streetAddress coordinates zipCode")
        .populate("roomID", "_id name count type")
        .populate({
          path: "hostID",
          model: "Host",
          select: "_id bankName bankNumber swiftCode nameOnCard",
          populate: {
            path: "customerID",
            model: "Customer",
            select: "_id name photo phoneNumber email",
          },
        })
        .populate("facilityTypeID", "_id name")
        .populate({
          path: "facilityTypeID",
          model: "FacilitiesType",
          select: "_id name",
          populate: {
            path: "facilitiesDetail",
            model: "FacilitiesDetail",
            select: "_id facilityName amount",
          },
        })
        .exec();

      if (!existingHouse)
        return res.status(404).json({ msg: "Housestay không còn tồn tại" });

      res.status(200).json({ houses: existingHouse });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  ratingHouse: async (req, res) => {
    try {
      const { houseID, customerID, bookingID } = req.params;
      const { ratingPoint, ratingDescription } = req.body;

      const existingRating = await Rating.findOne({ houseID, bookingID, customerID });
      
      if (existingRating) return res.status(400).json({ msg: "Housestay đã được đánh giá" });

      const existingBooking = await Booking.findOne({ _id: bookingID, customerID: customerID, houseID: houseID});

      if (!existingBooking || existingBooking.bookingStatus !== "Hoàn thành") return res.status(400).json({ msg: "Bạn chưa được đánh giá" });

      const existingHouse = await House.findById({ _id: houseID });
      if (!existingHouse) return res.status(400).json({ msg: "Housestay không còn tồn tại" });

      await Rating.create({houseID, bookingID, customerID: customerID, ratingPoint, ratingDescription,});

      return res.status(200).json({ msg: "Đánh giá thành công" });
    } catch (error) {
      console.log("🚀 ~ file: houseController.js:682 ~ ratingHouse: ~ error:", error)
      res.status(500).json({ msg: error.message });
    }
  },

  getHouseCreatedByHost: async (req, res) => {
    try {
      let { page, limit } = req.query;
      const { customerID } = req.params;

      const existingHost = await Host.findOne({ customerID });

      if (!existingHost)
        res.status(400).json({ msg: "Tài khoản không tồn tại" });

      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 20;
      const skip = (page - 1) * limit;

      const query = House.find({ hostID: existingHost._id })
        .populate("calenderID", "_id available dateFrom dateTo")
        .populate("locationID", "_id city streetAddress coordinates zipCode")
        .populate("roomID", "_id name count type")
        .populate({
          path: "hostID",
          model: "Host",
          select: "_id bankName bankNumber swiftCode nameOnCard",
          populate: {
            path: "customerID",
            model: "Customer",
            select: "_id name photo phoneNumber email",
          },
        })
        .populate("facilityTypeID", "_id name")
        .populate({
          path: "facilityTypeID",
          model: "FacilitiesType",
          select: "_id name",
          populate: {
            path: "facilitiesDetail",
            model: "FacilitiesDetail",
            select: "_id facilityName amount",
          },
        });

      const results = await query.exec();
      const paginatedHouses = results.slice(skip, skip + limit);

      res
        .status(200)
        .json({ houses: paginatedHouses, houseQuantity: results.length });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  deleteHouseByHost: async (req, res) => {
    try {
      const { customerID, houseID } = req.params;
      const existingHost = await Host.findOne({ customerID });
      if (!existingHost)
        res.status(400).json({ msg: "Tài khoản không tồn tại" });
      const existingHouse = await House.findOne({
        _id: houseID,
        hostID: existingHost._id,
      }).populate({
        path: "facilityTypeID",
        model: "FacilitiesType",
        select: "_id name",
        populate: {
          path: "facilitiesDetail",
          model: "FacilitiesDetail",
          select: "_id facilityName amount",
        },
      });

      if (!existingHouse) {
        return res.status(400).json({ msg: "Housestay không tồn tại" });
      }

      const existingBooking = await Booking.findOne({
        houseID: existingHouse._id,
        checkOutDate: { $gt: new Date() },
        bookingStatus: { $ne: "Đã huỷ" },
      });

      if (existingBooking) {
        return res.status(400).json({ msg: "Housestay đang được booking." });
      }

      const deleteOperations = [
        House.deleteOne({ _id: existingHouse._id }),
        Room.deleteOne({ _id: existingHouse.roomID }),
        Location.deleteOne({ _id: existingHouse.locationID }),
        Calendar.deleteOne({ _id: existingHouse.calenderID }),
      ];

      await Promise.all(deleteOperations);

      for (const fa of existingHouse.facilityTypeID) {
        await FacilitiesType.deleteOne({ _id: fa._id });
        for (const de of fa.facilitiesDetail) {
          await FacilitiesDetail.deleteOne({ _id: de._id });
        }
      }

      res.status(200).json({ msg: "Xóa housestay thành công" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

export default houseController;
