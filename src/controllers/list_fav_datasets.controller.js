const ListFavDatasetsService = require('../services/list_fav_dataset.services');
const {models} = require('../libs/sequelize');
const service = new ListFavDatasetsService();


const create = async (req, res) => {
    try{
        const response = await service.create(req);
        res.json({success: true, data: response});
    }catch (error){
        res.status(500).send({success: false, message: error.message});
    }
}

const get = async (req,res) => {
    try{
        const {id} = req.params;
        const response = await service.find(id);
        res.json(response);
    } catch (error){
        res.status(500).send({success: false, message: error.message});
    }
}

const _delete = async (req,res) => {
    try{
        const {id} = req.params;
        const {id2} = req.params;
        const response = await service.delete(id,id2);
        res.json(response);
    }catch(error){
        res.status(500).send({success:false,message:error.message});
    }
}

module.exports = {
    create,get,_delete
};