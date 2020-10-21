//jshint esversion:6
var Sequelize = require('sequelize');

var sequelize = new Sequelize('feedback', 'main_admin@feedbacks', 'Markssmileys1', {
	host: 'feedbacks.mysql.database.azure.com',
	dialect: 'mysql'
});

var Updates = sequelize.define('Updates', {
		idup: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoincrement: true
		},
    description: Sequelize.STRING,
    hotfixid: Sequelize.STRING,
		installedOn: Sequelize.STRING
    }, {
    freezeTableName: true
});

Updates.associate = (models) => {
 Updates.BelongsTo(MainInfo, {foreignKey : 'idup'});
};

sequelize.sync()
    .then()
    .catch(error => console.log('This error occured', error));

module.exports = Updates;
