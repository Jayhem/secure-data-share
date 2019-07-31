/* eslint-disable no-console */
import React from "react";
// nodejs library that concatenates classes
import classnames from "classnames";


// reactstrap components
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardImg,
  FormGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col
} from "reactstrap";

// core components
import DemoNavbar from "./components/Navbars/DemoNavbar.jsx";
import CardsFooter from "./components/Footers/CardsFooter.jsx";

// index page sections
import ContentTabs from "./views/IndexSections/ContentTabs.jsx";
import dataShareContract from "./contracts/dataShare.json";
import "./App.css";

//web3 stuff
import getWeb3 from './utils/getWeb3';
import IPFSUtil from './utils/multihash';
import {getIpfsUrl} from "./utils/ipfs.js"

class App extends React.Component {
  constructor(props) {
  super(props);
  this.state = { 
  ownerData: [],
  userContent : [],
  web3: null,
  accounts: null,
  contract: null,
  owner : false,
  pendingRequests : [],
  dataDict : {},
  dataToDiscover : []};
  
  this.handleWeb3Change = this.handleWeb3Change.bind(this);
  this.refreshContractInfo = this.refreshContractInfo.bind(this);
  }

  render() {
    return (
      <div className="App">
      <section className="section section-components">
            <Container>
              <ContentTabs theContent={this.state.ownerData} 
              userContent={this.state.userContent}
              owner={this.state.owner}
              web3={this.state.web3}
              accounts={this.state.accounts}
              contract={this.state.contract}
              pendingRequests={this.state.pendingRequests}
              dataDict={this.state.dataDict}
              onWeb3Change={this.handleWeb3Change}
              dataToDiscover={this.state.dataToDiscover}
              />
            </Container>
      </section>
      </div>
    );
  }
  async componentDidMount() {
      try {
      // Get network provider and web3 instance.
      const  web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = dataShareContract.networks[networkId];
      const instance = new web3.eth.Contract(
        dataShareContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // retrieving content from contract's methods.
      this.setState({ web3:web3, accounts:accounts, contract: instance }, this.refreshContractInfo);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  async handleWeb3Change() {
    this.setState({ }, this.refreshContractInfo);
  }

  async refreshContractInfo() {
    const { accounts, contract } = this.state;

    // Are you the owner of the contract?
    const data_owner = await contract.methods.owner().call();
    const validOwner = (data_owner === accounts[0]);

    // Get the data index from the contract
    const data_index = await contract.methods.data_index().call();

    // if (data_index < 2) {
    //   // first create some data to retrieve
    //   const bs58content1 = "QmarHSr9aSNaPSR6G9KFPbuLV9aEqJfTk1y9B8pdwqK4Rq"
    //   const bs58content2 = "QmarHSr9aSNaPSR6G9KFPbuLV9aEqJfTk1y9B8pdwq5555"
    //   if (data_index == 0) {
    //   const content1 = IPFSUtil.getBytes32FromMultiash(bs58content1).digest
    //   await contract.methods.addContent(content1).send({from:accounts[0]});
    //   }
    //   else {
    //     const content2 = IPFSUtil.getBytes32FromMultiash(bs58content2).digest
    //     await contract.methods.addContent(content2).send({from:accounts[0]});
    //   }
    // }
   

    // Get the data IPFS location for every datum and build a dictionnary
    // from IPFS location to data_id
    // retrieve title and content from IPFS
    var ownerDataConst = [];
    var dataDict = {}
    for (var i = 0; i < data_index; i++) {
      const bytes32hash = await contract.methods.getDataLocation(i).call({from:accounts[0]} );
      const multihash = IPFSUtil.getMultihashFromContractResponse(bytes32hash)
      let ipfs_url = getIpfsUrl(multihash);
      let response = await fetch(ipfs_url);
      let content_detail = await response.json();
      console.log('jsonified ' + content_detail);

      const curr_cont = [i,multihash,content_detail];
      dataDict[multihash]=i;
      ownerDataConst.push(curr_cont);
    }

    // get content shared with the user and what he can discover
    var userContent = [];
    var userDict = {};
    var dataToDiscover = [];

    if (!validOwner) {
    for (var i = 0; i < data_index; i++) {
      const status = await contract.methods.getUserStatusForDatum(i,accounts[0]).call({from:accounts[0]} );
      // console.log("status : " + status + " for content " + i);
      // console.log("ownerData entry : " + ownerDataConst[i]);
      if (status == 2){
        // console.log('in the status if : ' + ownerDataConst[i]);
      userContent.push(ownerDataConst[i]);
      userDict[ownerDataConst[i][1]]=ownerDataConst[i][0];
      }
      }
    
  
    // console.log("user content " + userContent);

    // Building the data to be discovered by the user
    for (var content in dataDict) {
      // console.log("in discovery dataDict: " + content + " contentid : " + dataDict[content]);
      // console.log("in discovery userDict: " + content + " contentid : " + userDict[content]);
      if (userDict[content] == null) {
        // console.log('in if discovery, userDict : ' + userDict[content]);
        dataToDiscover.push([dataDict[content],content]);
      }
    }
    } 

    // getAllPendingRequests
    var ownerPendingRequests = []
    const requests = await contract.methods.getAllPendingRequests().call();
    const data_ids = requests[0];
    const users = requests[1];
    console.log('display the requests from contract');
    console.log(users);
    console.log(data_ids);

    for (var i = 0; i < data_ids.length; i++) {
      const row = [data_ids[i],users[i]];
      ownerPendingRequests.push(row);
    }
    // console.log(ownerPendingRequests);
    // Update state with the result.
    this.setState({ dataToDiscover : dataToDiscover, dataDict: dataDict, ownerData: ownerDataConst, owner : validOwner, pendingRequests : ownerPendingRequests, userContent : userContent});
  };
}
export default App;
