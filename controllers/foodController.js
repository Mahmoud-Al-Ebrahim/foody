const Food = require('../models/Food');

module.exports = {
    addFood: async (req, res) => {
        const { title, foodTags, category, code, restaurant, description, time, price, additives, imageUrl } = req.body;

        if (!title || !foodTags || !category || !code || !restaurant || !description || !time || !price || !additives || !imageUrl) {
            return res.status(400).json({ status: false, message: " You have a missing field" });
        }

        try {
            const newFood = new Food(req.body);

            await newFood.save();

            res.status(201).json({ status: true, message: "Food has been succesfully added" });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
getFoodById: async (req, res) => {
    const id = req.params.id;
    try {
        const food = await Food.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: "$restaurant" }
        ]);
        res.status(200).json(food[0] || {});
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
},

getRandomFood: async (req, res) => {
    try {
        let randomFoodList = [];

        const pipeline = (matchFilter, sampleSize) => [
            { $match: matchFilter },
            { $sample: { size: sampleSize } },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: "$restaurant" },
            { $project: { __v: 0 } }
        ];

        if (req.params.code) {
            randomFoodList = await Food.aggregate(
                pipeline({ code: req.params.code, isAvailable: true }, 3)
            );
        }

        if (!randomFoodList.length) {
            randomFoodList = await Food.aggregate(
                pipeline({ isAvailable: true }, 5)
            );
        }

        if (randomFoodList.length) {
            res.status(200).json(randomFoodList);
        } else {
            res.status(404).json({ status: false, message: 'No Food Found' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
},

searchFoods: async (req, res) => {
    const search = req.params.search;

    try {
        const results = await Food.aggregate([
            {
                $search: {
                    index: "foods",
                    text: {
                        query: search,
                        path: { wildcard: "*" }
                    }
                }
            },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: "$restaurant" }
        ]);

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
},

getAllFoodsByCode: async (req, res) => {
    const code = req.params.code;

    try {
        const foodList = await Food.aggregate([
            { $match: { code: code } },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: "$restaurant" }
        ]);

        return res.status(200).json(foodList);
    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
},

getFoodsByRestaurant: async (req, res) => {
    const id = req.params.id;
    try {
        const foods = await Food.aggregate([
            { $match: { restaurant: new mongoose.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: "$restaurant" }
        ]);

        res.status(200).json(foods);
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
},

getFoodsByCategoryAndCode: async (req, res) => {
    const { category, code } = req.params;
    try {
        const foods = await Food.aggregate([
            { $match: { category, code, isAvailable: true } },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: "$restaurant" },
            { $project: { __v: 0 } }
        ]);

        res.status(200).json(foods);
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
},

getRandomFoodsByCategoryAndCode: async (req, res) => {
    const { category, code } = req.params;

    try {
        let foods = await Food.aggregate([
            { $match: { category, code, isAvailable: true } },
            { $sample: { size: 10 } },
            {
                $lookup: {
                    from: 'restaurants',
                    localField: 'restaurant',
                    foreignField: '_id',
                    as: 'restaurant'
                }
            },
            { $unwind: "$restaurant" }
        ]);

        if (!foods.length) {
            foods = await Food.aggregate([
                { $match: { code, isAvailable: true } },
                { $sample: { size: 10 } },
                {
                    $lookup: {
                        from: 'restaurants',
                        localField: 'restaurant',
                        foreignField: '_id',
                        as: 'restaurant'
                    }
                },
                { $unwind: "$restaurant" }
            ]);
        }

        if (!foods.length) {
            foods = await Food.aggregate([
                { $match: { isAvailable: true } },
                { $sample: { size: 10 } },
                {
                    $lookup: {
                        from: 'restaurants',
                        localField: 'restaurant',
                        foreignField: '_id',
                        as: 'restaurant'
                    }
                },
                { $unwind: "$restaurant" }
            ]);
        }

        res.status(200).json(foods);
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
}
};
/*
    getFoodById: async (req, res) => {
        const id = req.params.id;
        try {
            const food = await Food.findById(id);

            res.status(200).json(food);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getRandomFood: async (req, res) => {
        try {
            let randomFoodList = [];

            // check if code is provided in the params

            if (req.params.code) {
                randomFoodList = await Food.aggregate([
                    { $match: { code: req.params.code, isAvailable: true } },
                    { $sample: { size: 3 } },
                    { $project: { __v: 0 } }
                ]);
            }

            // if no code provided in params or no foods matches
            if (!randomFoodList.length) {
                randomFoodList = await Food.aggregate([
                    { $match: { isAvailable: true } },
                    { $sample: { size: 5 } },
                    { $project: { __v: 0 } }
                ]);
            }

            // respond with the results
            if (randomFoodList.length) {
                res.status(200).json(randomFoodList);
            } else {
                res.status(404).json({ status: false, message: 'No Food Found' });
            }
        } catch (error) {
            res.status(500).json(error);
        }

    },

    searchFoods: async (req, res) => {
        const search = req.params.search;

        try {
            const results = await Food.aggregate([
                {
                    $search: {
                        index: "foods",
                        text: {
                            query: search,
                            path: {
                                wildcard: "*"
                            }
                        }
                    }
                }
            ])

            res.status(200).json(results);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getAllFoodsByCode: async (req, res) => {
        const code = req.params.code;

        try {
            const foodList = await Food.find({ code: code });

            return res.status(200).json(foodList);
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    },
    // restaurant menu
    getFoodsByRestaurant: async (req, res) => {
        const id = req.params.id;
        try {
            const foods = await Food.find({ restaurant: id });

            res.status(200).json(foods);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    getFoodsByCategoryAndCode: async (req, res) => {
        const { category, code } = req.params;
        try {
            const foods = await Food.aggregate([
                { $match: { category: category, code: code, isAvailable: true } },
                { $project: { __v: 0 } }
            ]);

            if (foods.lenght === 0) {
                return res.status(200).json([]);
            }
            res.status(200).json(foods);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getRandomFoodsByCategoryAndCode: async (req, res) => {
        const { category, code } = req.params;

        try {
            let foods;

            foods = await Food.aggregate([
                { $match: { category: category, code: code, isAvailable: true } },
                { $sample: { size: 10 } },
            ])

            if (!foods || foods.length === 0) {
                foods = await Food.aggregate([
                    { $match: { code: code, isAvailable: true } },
                    { $sample: { size: 10 } },
                ])
            } else if (!foods || foods.length === 0) {
                foods = await Food.aggregate([
                    { $match: { isAvailable: true } },
                    { $sample: { size: 10 } },
                ])
            }
            res.status(200).json(foods);
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
};
*/