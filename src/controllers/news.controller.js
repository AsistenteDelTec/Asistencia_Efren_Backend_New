const NewsService = require('../services/news.services');
const RelationshipUserNew = require('../services/relationship_user_new.services');
const service = new NewsService();
const relationshipUserNew = new RelationshipUserNew();

const create = async (req, res) => {
    try {
        const response = await service.create(req);

        const data = {
            id_user: req.body.userID,
            id_new: response.dataValues.id,
        };

        await relationshipUserNew.create({ body: data });
        
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const get = async (req, res) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const getAllWithUser = async (req, res) => {
    try {
        const response = await service.find();
        const newsWithUser = await Promise.all(
            response.map(async (news) => {
                const relationship = await relationshipUserNew.findUser(news.id);
                return { ...news.dataValues, user: relationship.userFound };
            })
        );
        res.json({ success: true, data: newsWithUser });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });

    }
}

const getWithUser = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        const relationship = await relationshipUserNew.findUser(response.id);
        const news = {
            cont_views: response.cont_views,
            id: response.id,
            large_description: response.large_description,
            news_name: response.news_name,
            publish_date: response.publish_date,
            score: response.score,
            small_description: response.small_description,
            status: response.status,
            url_new: response.url_new,
            user: relationship.userFound
        }
        res.json(news);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });

    }
}

const getPostsByYear = async (req, res) => {
    try {
        const {year} = req.params;
        const response = await service.getPostsByYear(year);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const response = await service.update(id, body);
        res.json(response)
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const _delete = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await service.delete(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

module.exports = {
    create, get, getAllWithUser, getById, getWithUser, getPostsByYear, update, _delete
};