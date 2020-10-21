//jshint esversion:6
var Sequelize = require('sequelize');

var sequelize = new Sequelize('feedback', 'main_admin@feedbacks', 'Markssmileys1', {
	host: 'feedbacks.mysql.database.azure.com',
	dialect: 'mysql'
});

var MainInfo = sequelize.define('MainInfo', {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoincrement: true
		},
    num_of_stars: Sequelize.STRING,
    ip: Sequelize.STRING,
    windows_type: Sequelize.STRING,
    email: Sequelize.STRING
    }, {
    freezeTableName: true
});

MainInfo.associate = (models) => {
 MainInfo.hasMany(Services, {as : 'Services', foreignKey : 'idser'});
};

MainInfo.associate = (models) => {
 MainInfo.hasMany(Updates, {as : 'Updates', foreignKey : 'idup'});
};

MainInfo.associate = (models) => {
 MainInfo.hasMany(Windows, {as : 'Windows', foreignKey : 'idwn'});
};

sequelize.sync()
    .then()
    .catch(error => console.log('This error occured', error));

module.exports = MainInfo;
