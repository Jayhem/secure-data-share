var dataMgt = artifacts.require("dataShare");
var iterablemap = artifacts.require("iterableMapping");

module.exports = function(deployer) {
  // deployer.deploy(iterablemap);
  // deployer.link(iterablemap, dataMgt);
  deployer.deploy(dataMgt);
};
