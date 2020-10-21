//jshint esversion:6
var Sequelize = require('sequelize');

var sequelize = new Sequelize('feedback', 'main_admin@feedbacks', 'Markssmileys1', {
	host: 'feedbacks.mysql.database.azure.com',
	dialect: 'mysql'
});

var Services = sequelize.define('Services', {
		idser: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoincrement: true
		},
    name: Sequelize.STRING,
    state: Sequelize.STRING
    }, {
    freezeTableName: true
});

Services.associate = (models) => {
 Services.BelongsTo(MainInfo, {foreignKey : 'idser'});
};

sequelize.sync()
    .then()
    .catch(error => console.log('This error occured', error));

module.exports = Services;
