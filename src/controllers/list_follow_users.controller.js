const ListFollowUsersService = require('../services/list_follow_users.services');
const {models} = require('../libs/sequelize');
const service = new ListFollowUsersService();


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
        console.log(response);
        res.json(response);
    } catch (error){
        res.status(500).send({success: false, message: error.message});
    }
}

const getRelation = async (req,res) => {
    try{
        const {id} = req.params;
        const {id2} = req.params;
        const response = await service.findOne(id,id2);
        console.log(response);
        res.json(response);
    } catch (error){
        res.status(500).send({success: false, message: error.message});
    }
}

const update = async (req,res) => {
    try {
        const {id} = req.params;
        const body = req.body;
        const response = await service.update(id,body);
        res.json(response)
    }catch (error){
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
    create,get,update,getRelation,_delete
};