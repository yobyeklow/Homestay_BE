const listingController = {
  listingHouse: async (req, res) => {
    try {
      const { country, state } = req.body;
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
