/* eslint-disable no-console */
import React from "react";


// Ethereum GUI helpers
//import {Blockie, PublicAddress} from "rimble-ui";
import Address from "./components/Address";

// ENS
//import ENS from 'ethereum-ens';

// reactstrap components
import {
  Container,
  Row,
  Col
} from "reactstrap";


// index page sections
import ContentTabs from "./components/ContentTabs.jsx";
import PauseButton from "./components/PauseButton.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import DataShareContract from "./contracts/dataShare.json";
import "./App.css";

//web3 stuff
import getWeb3 from './utils/getWeb3';
// import web3 from 'web3';
import IPFSUtil from './utils/multihash';
import {getIpfsUrl} from "./utils/ipfs.js"

class App extends React.Component {
  constructor(props) {
  super(props);
  console.log('in Apps constructor')
  this.state = { 
  ownerData: [],
  userContent : [],
  web3: null,
  accounts: [],
  contract: {},
  owner : false,
  pendingRequests : [],
  dataDict : {},
  dataToDiscover : [],
  allDataDict : {},
  paused : false,
  contractReady : false,
  provider: null};
  
  this.handleWeb3Change = this.handleWeb3Change.bind(this);
  this.refreshContractInfo = this.refreshContractInfo.bind(this);
  this.subscribeLogEvent = this.subscribeLogEvent.bind(this);
  }

  render() {
    console.log('in Apps render');
    var items = [];
    if (!this.state.contractReady) {
      console.log('in Apps render - contract not ready');
      items.push(<div className="App">
      <section className="section section-components">
            <Container>
            <Row className="justify-content-center"></Row>
            </Container>
      </section>
      </div>);
    }
    else {
      console.log('in Apps render - contract is ready');
      items.push(
        <div className="App">
        <section className="section section-components">
              <Container>
                <Row className="justify-content-center">
                <ErrorBoundary>
                <Address value={this.state.accounts[0]}
                 web3={this.state.web3}/>
                </ErrorBoundary>
                </Row>
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
                allDataDict={this.state.allDataDict}
                contractReady={this.state.contractReady}
                />
                <PauseButton paused={this.state.paused}
                onWeb3Change={this.handleWeb3Change}
                owner={this.state.owner}
                web3={this.state.web3}
                accounts={this.state.accounts}
                contract={this.state.contract}
                disabled={this.state.owner}
                contractReady={this.state.contractReady}
                />
              </Container>
        </section>
        </div>
      );
    }
    return items;
  }
  async componentDidMount() {
    console.log('in Apps componentDidMount - start')
      try {      
      await this.setState({ }, await this.fetchWeb3);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
    console.log('in Apps componentDidMount - end')
  };

// Subscriber method
 subscribeLogEvent = (contract, eventName) => {
   // a list for saving subscribed event instances
    // var subscribedEvents = this.state.subscribedEvents;
    const web3 = this.state.web3;
  // var subscribedEvents = this.state.subscribedEvents;
  const eventJsonInterface = web3.utils._.find(    contract._jsonInterface,    o => o.name === eventName && o.type === 'event',  )
    const subscription = web3.eth.subscribe('logs', {    address: contract.options.address,    topics: [eventJsonInterface.signature]  }, 
      (error, result) => {
        if (!error) {
        const eventObj = web3.eth.abi.decodeLog(        eventJsonInterface.inputs,        result.data,        result.topics.slice(1)      )      
    console.log(`New ${eventName}!`, eventObj);
          this.refreshContractInfo();
        }
      })

    // subscribedEvents[eventName] = subscription
    // this.setState({ subscribedEvents: subscribedEvents });
  }


  async handleWeb3Change() {
    this.setState({ }, await this.refreshContractInfo);
  }

  async fetchWeb3() {
    try {
        // Get network provider and web3 instance.
        const  web3 = await getWeb3();
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = DataShareContract.networks[networkId];
        const contract = new web3.eth.Contract(
          DataShareContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        // const provider = web3.givenProvider;
        // console.log(JSON.stringify(provider));

    this.setState({web3:web3, accounts:accounts, contract: contract}, await this.refreshContractInfo);
    // subscribe to logs to be able to refresh later  
        this.subscribeLogEvent(contract, 'LogContentAdded');
        this.subscribeLogEvent(contract, 'LogAccessRequestWithPubKey');
        this.subscribeLogEvent(contract, 'LogAccessGranted');

    }
  catch (error) {
    // Catch any errors for any of the above operations.
    console.error(error);
  }
};


  async refreshContractInfo() {
    try {
      const contract = this.state.contract;
      const accounts = this.state.accounts;
      
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
    var dataDict = {} // key is IPFS multihash -> data_id
    var allDataDict = {} // key is data_id -> JSON data
    for (var i = 0; i < data_index; i++) {
      const bytes32hash = await contract.methods.getDataLocation(i).call({from:accounts[0]} );
      const multihash = IPFSUtil.getMultihashFromContractResponse(bytes32hash)
      let ipfs_url = getIpfsUrl(multihash);
      let response = await fetch(ipfs_url);
      let content_detail = await response.json();
      let object_content_detail = JSON.parse(content_detail)
      console.log('objectified ' + object_content_detail);
      allDataDict[i] = object_content_detail;
      // console.log('json access of metadata ' + allDataDict[i].metadata);

      const curr_cont = [i,multihash];
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
    if (requests) {
    const data_ids = requests[0];
    const users = requests[1];
    console.log('display the requests from contract');
    console.log(users);
    console.log(data_ids);

    for (var i = 0; i < data_ids.length; i++) {
      const row = [data_ids[i],users[i]];
      ownerPendingRequests.push(row);
    }
  }
  // get contract paused state
  var contractPaused = false;
  contractPaused = await contract.methods.paused().call();



    // Update state with the result.
    const contractReady = true;
    this.setState({ contractReady : contractReady, paused : contractPaused, allDataDict:allDataDict, dataToDiscover : dataToDiscover, dataDict: dataDict, ownerData: ownerDataConst, owner : validOwner, pendingRequests : ownerPendingRequests, userContent : userContent});
    
  } catch (error) {
    // Catch any errors for any of the above operations.
    console.error(error);
  }
  };
}
export default App;
