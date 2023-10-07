import Calendar from "../model/calendar.js";
import Coordinate from "../model/coordinate.js";
import FacilitiesDetail from "../model/facilitiesDetails.js";
import FacilitiesType from "../model/facilitiesType.js";
import Host from "../model/host.js";
import House from "../model/house.js";
import Location from "../model/location.js";
import Room from "../model/room.js";

const houseController = {
  postHouseStay: async (req, res) => {
    try {
      const { customerID } = req.params;
      const { house, coordinate, location, calendar, rooms, facilities } =
        req.body;

      // Check for required fields
      if (
        !house ||
        !coordinate ||
        !location ||
        !calendar ||
        !facilities ||
        !rooms
      ) {
        return res.status(400).json({ msg: "Vui lòng cung cấp đủ thông tin" });
      }

      const existingHost = await Host.findOne({ customerID });

      if (!existingHost) {
        return res.status(400).json({ msg: "Không tìm thấy tài khoản" });
      }

      // Create the House document
      const createHouse = await House.create({
        hostID: existingHost._id,
        numberGuest: house.numberGuest,
        title: house.title,
        description: house.description,
        costPerNight: house.costPerNight,
        images: house.images,
      });

      // Create the Coordinate document
      const createCoordinate = await Coordinate.create({
        x: coordinate.x,
        y: coordinate.y,
      });

      // Create the Calendar document
      await Calendar.create({
        houseID: createHouse._id,
        dateFrom: calendar.dateFrom,
        dateTo: calendar.dateTo,
      });

      // Create the Location document
      const createLocation = await Location.create({
        streetAddress: location.streetAddress,
        city: location.city,
        zipCode: location.zipCode,
        coordinates: createCoordinate._id,
      });

      // Create Room documents and get their IDs
      const roomIDs = await Promise.all(
        rooms.map(async (room) => {
          const result = await Room.create({
            name: room.name,
            type: room.type,
            bedCount: room.bedCount,
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
          $push: {
            roomID: { $each: roomIDs },
            facilityTypeID: { $each: facilitiesIDs },
            locationID: createLocation._id,
          },
        }
      );

      res.status(200).json({ msg: "House stay created successfully" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },
};

export default houseController;
