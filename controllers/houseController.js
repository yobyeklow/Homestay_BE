import Calendar from "../model/calendar.js";
import Customer from "../model/customer.js";
import FacilitiesDetail from "../model/facilitiesDetails.js";
import FacilitiesType from "../model/facilitiesType.js";
import Host from "../model/host.js";
import House from "../model/house.js";
import Location from "../model/location.js";
import Room from "../model/room.js";

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
            bedCount: room.bedCount,
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
            location.streetAddress || existingLocation.streetAddress,
          city: location.city || existingLocation.city,
          zipCode: location.zipCode || existingLocation.zipCode,
          coordinates: {
            x: location.coordinates?.x || existingLocation.coordinates.x,
            y: location.coordinates?.y || existingLocation.coordinates.y,
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
              bedCount: room.bedCount || existingRoom.bedCount,
            };
            await Room.findOneAndUpdate(
              { _id: room._id, houseID },
              updatedRoom
            );
          } else {
            const newRoom = await Room.create({
              name: room.name,
              type: room.type,
              bedCount: room.bedCount,
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
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 20;

      const skip = (page - 1) * limit;

      // Fetch calendars with available set to true, paginated
      const calendars = await Calendar.find({ available: true })
        .skip(skip)
        .limit(limit);

      // Create an array of promises to fetch house data for each calendar
      const dataPromises = calendars.map(async (calendar) => {
        const result = await House.findOne({ _id: calendar.houseID })
          .populate("locationID")
          .populate("roomID")
          .populate("hostID")
          .populate({
            path: "facilityTypeID",
            populate: {
              path: "facilitiesDetail",
              model: "FacilitiesDetail",
            },
          })
          .exec();

        const customer = await Customer.findOne({
          _id: result.hostID.customerID,
        });

        const house = Object.assign(
          {
            _id: result._id,
            locationID: result.locationID,
            roomID: result.roomID,
            facilityTypeID: result.facilityTypeID,
            hostID: result.hostID._id,
            numberGuest: result.numberGuest,
            title: result.title,
            description: result.description,
            costPerNight: result.costPerNight,
            images: result.images,
          },
          {
            calendarID: {
              _id: calendar._id,
              available: calendar.available,
              dateFrom: calendar.dateFrom,
              dateTo: calendar.dateTo,
            },
            customerID: {
              _id: customer._id,
              name: customer.name,
              photo: customer.photo,
            },
          }
        );

        return house;
      });

      // Execute all the promises in parallel and wait for all of them to resolve
      const houseData = await Promise.all(dataPromises);

      res.status(200).json({ houses: houseData });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  getAllHouseStayNearLocation: async (req, res) => {
    try {
      const { sw, ne } = req.query;

      // const calendars = await Calendar.find({ available: true });

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
          select: "_id name bedCount type",
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
          sw.latitude <= house.locationID.coordinates.x <= ne.latitude &&
          sw.longtitude <= house.locationID.coordinates.y <= ne.latitude;

        return house.calenderID.available === true && isNearLocation;
      });
      res.status(200).json({ houses: filteredHouses });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

export default houseController;