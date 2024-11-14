const { models } = require('../libs/sequelize');
const { Op, fn, col, Sequelize } = require('sequelize');

class DatasetsService {
    
    async create(data) {
        const datasetData = {
            dataset_name: data.body.dataset_name,
            publish_date: new Date(),
            description: data.body.description,
            score: 0,
            url_source: data.body.url_source,
            version: '1.0.0',
            privated: false,
            cont_views: 0,
            status: 'Pending',
        };
        try{
            // Crea el dataset y obtiene su ID
            const dataset = await models.Datasets.create(datasetData);
            return dataset;
        }catch(error){
            console.error("Error creating dataset", error.message);
            throw new Error(error.message || "Error creando el dataset");
        }
    }

    async find() {
        try{
            const res = await models.Datasets.findAll({
              order: [['id', 'ASC']],
              include: [
                {
                    model: models.Categories,
                    as: 'category',
                    where: { visible: true }, // Filtra por categorías visibles
                    required: false // This makes the join a LEFT JOIN, including datasets without a category
                },
                {
                    model: models.Users,
                    as: 'user',
                    attributes: ['fullname']
                }
              ],
            });
            return res;
          } catch (error) {
          console.error('Error fetching data:', error);
          throw error; // Propagate the error if needed
        }
    }

    async findPages({ page = 1, limit = 10000, search = '', category, status='Accepted', privated=false }) {
        try {
            console.log("Categoria recibida: ", category)
            const offset = (page - 1) * limit;

            // Condiciones del where principal
            const whereConditions = {
            [Op.and]: [
                { dataset_name: { [Op.iLike]: `%${search}%`} }, // Filtrar por nombre del dataset
                { status },                      // Solo dataset con status 'Accepted'
                { privated }                          // Solo dataset que no sean privados
            ]
            };

            // Si hay un category, agregarlo a las condiciones del where
            if (category) {
            whereConditions[Op.and].push(
                Sequelize.literal(`EXISTS (SELECT 1 FROM "relationship_dataset_category" AS "RelationshipDatasetCategory" WHERE "RelationshipDatasetCategory"."id_dataset" = "Datasets"."id" AND "RelationshipDatasetCategory"."id_category" = ${category})`)
            );
            }
        
            const res = await models.Datasets.findAndCountAll({
            include: [
                {
                model: models.Categories,
                as: 'category',
                where: { visible: true},   // Filtra por categorías visibles
                required:false
                },
                {
                model: models.Users,
                as: 'user',
                attributes: ['fullname'],
                },
            ],
            
            where:whereConditions,
            limit, // Limita los resultados devueltos
            offset, // Define desde qué registro iniciar
            order: [['id', 'ASC']],
            distinct: true  // Asegura que el conteo sea de datasets únicos, no duplicados por las categorías
            });
            
            console.log({
            totalItems: res.count,
            totalPages: Math.ceil(res.count / limit),
            currentPage: page,
            datasets: res.rows,  // Datasets devueltos
            })
            return {
            totalItems: res.count,
            totalPages: Math.ceil(res.count / limit),
            currentPage: page,
            datasets: res.rows,  // Datasets devueltos
            };
        } catch (error) {
            console.error('Error fetching data with pagination:', error);
            throw error;
        }
    }

    async findWithPagination({ page = 1, limit = 12, search = '', category, status='Accepted', privated=false }) {
      try {
        console.log("Categoria recibida: ", category)
        const offset = (page - 1) * limit;
  
        // Condiciones del where principal
        const whereConditions = {
          [Op.and]: [
            { dataset_name: { [Op.iLike]: `%${search}%`} }, // Filtrar por nombre del modelo
            { status },                      // Solo modelos con status 'Accepted'
            { privated }                          // Solo modelos que no sean privados
          ]
        };
  
        // Si hay un category, agregarlo a las condiciones del where
        if (category) {
          whereConditions[Op.and].push(
            Sequelize.literal(`EXISTS (SELECT 1 FROM "relationship_dataset_category" AS "RelationshipDatasetCategory" WHERE "RelationshipDatasetCategory"."id_dataset" = "Datasets"."id" AND "RelationshipDatasetCategory"."id_category" = ${category})`)
          );
        }
    
        const res = await models.Datasets.findAndCountAll({
          include: [
            {
              model: models.Categories,
              as: 'category',
              where: { visible: true},   // Filtra por categorías visibles
              required:false
            },
            {
              model: models.Users,
              as: 'user',
              attributes: ['fullname'],
            },
          ],
          
          where:whereConditions,
          limit, // Limita los resultados devueltos
          offset, // Define desde qué registro iniciar
          order: [['id', 'ASC']],
          distinct: true  // Asegura que el conteo sea de modelos únicos, no duplicados por las categorías
        });
        
        return {
          totalItems: res.count,
          totalPages: Math.ceil(res.count / limit),
          currentPage: page,
          datasets: res.rows,  // Modelos devueltos
        };
      } catch (error) {
        console.error('Error fetching data with pagination:', error);
        throw error;
      }
}

    async findOne(id) {
        const res = await models.Datasets.findByPk(id);
        return res;
    }

    async getPostsByYear(year) {
        const results = await models.Datasets.findAll({
            attributes: [
                [fn('DATE_TRUNC', 'month', col('publish_date')), 'month'],
                [fn('COUNT', col('id')), 'count'],
            ],
            where: {
                publish_date: {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31`],
                },
                status: 'Accepted',
                privated: 'false'
            },
            group: [fn('DATE_TRUNC', 'month', col('publish_date'))],
            order: [[fn('DATE_TRUNC', 'month', col('publish_date')), 'ASC']],
        });

        const data = results.map(result => ({
            month: result.dataValues.month,
            count: result.dataValues.count,
        }));

        return (data)
    }

    async update(id, data) {
        // Comprueba que el dataset exista
        const dataset = await models.Datasets.findByPk(id);
        if (!dataset) {
            throw new Error('Dataset not found');
        }
        // Campos que actualiza un usuario
        const userFields = {
            dataset_name: data.dataset_name,
            description: data.description,
            url_source: data.url_source,
            version: data.version,
            privated: data.privated, 
        };
    
        // Campos que actualiza un admin
        const adminFields = {
            status: data.status,
            publish_date: data.publish_date,
            cont_views: data.cont_views,
        };
    
        // Se combinan todos los campos
        const updatedDatasetData = {
            ...userFields,
            ...adminFields,
        };
       
        // Se excluyen los campos vacíos
        Object.keys(updatedDatasetData).forEach(key => {
            if (updatedDatasetData[key] === undefined) {
            delete updatedDatasetData[key];
            }
        });

        try {
            // Se actualiza el dataset con solo los campos que sí llevan cambios
            await dataset.update(updatedDatasetData);

            return { success: true, data: dataset };
        } catch (error) {
            console.error("Error updating dataset", error.message);
            throw new Error(error.message || "Error actualizando el dataset");
        }
    }

    async delete(id) {
        const dataset = await this.findOne(id);
        await dataset.destroy();
        return { deleted: true };
    }

    async getTopRatedDatasets() {
        const topDatasets = await models.Datasets.findAll({
            order: [['score', 'DESC']],
            limit: 10,
            where: {
            status: 'Accepted',
            privated: 'false'
            },
        });
        return topDatasets;
    }

    async getTopViewedDatasets() {
        const topDatasets = await models.Datasets.findAll({
            attributes: ['id', 'dataset_name', 'cont_views', 'publish_date'],
            order: [['cont_views', 'DESC']],
            limit: 3,
            where: {
                status: 'Accepted',
                privated: 'false'
            },
            include: [
            {
                model: models.Users,
                as: 'user',
                attributes: ['fullname'],
                through: { attributes: [] },
            },
            ],
        });
        return topDatasets;
    }

    async findByStatus(status) {
        try {
          const datasetsByStatus = await models.Datasets.findAll({
            where: {
              status,
            },
            order: [['id', 'ASC']],
          });
      
          return datasetsByStatus;
        } catch (error) {
          console.error(`Error fetching datasets with status ${status}:`, error);
          throw error;
        }
      }

    async getTopDatasetsByCategory() {
    try {
        // First, find all categories
        const categories = await models.Categories.findAll({
        where: {
            visible: true,
        }
    });
    
        // For each category, fetch the top 3 datasets based on cont_views
        const topDatasetsByCategory = await Promise.all(categories.map(async (category) => {
        const topDatasets = await models.Datasets.findAll({
            attributes: ['id', 'dataset_name', 'cont_views', 'description'],
            include: [
            {
                model: models.Categories, // Junction table to link categories with models
                as: 'category', // Alias for the association
                where: { id: category.id }, // Filter by the current category ID
                attributes: [], // No need to retrieve attributes from the junction table
                required:true
            },
            {
                model: models.Users,
                as: 'user',
                attributes: ['fullname'],
                through: { attributes: [] },
            }
            ],
            where: {
                status: 'Accepted',
                privated: false
            },
            order: [['cont_views', 'DESC']],
            limit: 3, // Limit to top 3 datasets per category
        });
    
        return {
            category:category.categories_name,
            category_id:category.id,
            datasets:topDatasets,
        };
        }));
    
        return topDatasetsByCategory;
    } catch (error) {
        console.error('Error fetching top datasets:', error);
        throw error;
    }
    }
}

module.exports = DatasetsService;
