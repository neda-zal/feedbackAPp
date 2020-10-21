//jshint esversion:6
var Sequelize = require('sequelize');

var sequelize = new Sequelize('feedback', 'main_admin@feedbacks', 'Markssmileys1', {
	host: 'feedbacks.mysql.database.azure.com',
	dialect: 'mysql'
});

var Windows = sequelize.define('Windows', {
		idwn: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoincrement: true
		},
    windows: Sequelize.STRING
    }, {
    freezeTableName: true
});

Windows.associate = (models) => {
 Windows.BelongsTo(MainInfo, {foreignKey : 'idwn'});
};

sequelize.sync()
    .then()
    .catch(error => console.log('This error occured', error));

module.exports = Windows;
