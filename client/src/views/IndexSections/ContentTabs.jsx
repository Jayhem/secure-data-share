/*!

=========================================================
* Argon Design System React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-design-system-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-design-system-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
// nodejs library that concatenates classes
import classnames from "classnames";


// crypto libraries
import Sjcl from "sjcl";
import { encrypt, decrypt, PrivateKey, utils } from 'eciesjs';
import Ethereumjs from 'ethereumjs-util';


// IPFS related
import { uploadObjectIpfs } from "../../utils/ipfs";
import IPFSUtil from "../../utils/multihash";


// reactstrap components
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  NavItem,
  NavLink,
  Nav,
  TabContent,
  TabPane,
  Row,
  Col
} from "reactstrap";
import FullContentModal from "./FullContentModal";
import ErrorBoundary from "./ErrorBoundary"

class TabsSection extends React.Component {
  constructor(props) {
    super(props);
    console.log('in ContentTabs constructor')
  this.state = {
    iconTabs: 1,
    requestCheckboxes : {},
    contentSelected : 0,
    fullContentSelected : 0
  };

  // These bindings are necessary to make `this` work in the callbacks
  this.handleSubmit = this.handleSubmit.bind(this);
  this.handleTextChange = this.handleTextChange.bind(this);
  this.requestAccess = this.requestAccess.bind(this);
  this.handleRequestCheckbox = this.handleRequestCheckbox.bind(this);
  this.grantRequests = this.grantRequests.bind(this);
  this.rejectRequests = this.rejectRequests.bind(this);
  // this.setContent = this.setContent.bind(this);
}
  toggleNavs = (e, state, index) => {
    e.preventDefault();
    this.setState({
      [state]: index
    });
  };

  toggleModal = (state, index) => {
    this.setState({
      [state]: !this.state[state],
      contentSelected : index
    });
  };

  async encryptAndStuff (content,title) {
    var my_prng = new Sjcl.prng(8);
    my_prng.startCollectors();
    const bad_random = Sjcl.random.randomWords(4);

    // trick to extract the public key from a signed transaction
    const web3 = this.props.web3;
    const accounts = this.props.accounts;
    const fake_transaction =  `{from:${accounts[0]},to:${accounts[0]}, value:1}`;
    var rawTransaction = {
      "from": accounts[0],
      "to": accounts[0],
      "value": "10",
      "gas": "200000"
    };
    // console.log(rawTransaction);
    // var signed_tx = await web3.eth.signTransaction(rawTransaction);
    // var signed_tx2 = await web3.eth.value(1).transfer(accounts[0]);
    // const tx3 = await web3.eth.accounts.signTransaction({to: accounts[0],value: '1000000000',gas: 2000000, gasPrice:200},ownerPrivatekey);
    // console.log(tx3);
    // const ownerPublicKey = Ethereumjs.ecrecover(Ethereumjs.toBuffer(tx3.msgHash),tx3.v,tx3.r,tx3.s);
    // console.log(ownerPublicKey);
    const ownerPrivatekey = "0x63562bc5cf30b41eabac532e90760874fcda9e48";
    const userPrivatekey = "0x644beec4b8a18b1cfed82644dd6d3d3b3d105e0a";


    
    // const data = Buffer.from('this is a test')
    // decrypt(privatekey.toHex(), encrypt(publicKey.toHex(), data)).toString()

    // while (!my_prng.isReady()) {Sjcl.encrypt(bad_random, formdata)}
    // const aes_key = Sjcl.randomWords(4);
    // const encrypted_shared_key = encrypt(publicKey.toHex(), aes_key).toString()
    // const encrypted_data = Sjcl.encrypt(aes_key, formdata, { mode: 'ccm', iv: Sjcl.random.randomWords(3, 0) });
    
    var jsObject = {};
    var metadata = {}
    metadata.title = title;
    metadata.encrypted_data = content;
    jsObject.metadata = metadata;
    jsObject.owner_key = bad_random;
    jsObject.user_keys = [];

    // console.log('at CREATION :metadata : ' + jsObject.metadata);
    const stringifiedJson = JSON.stringify(jsObject);
    return (stringifiedJson);
  }

  requestAccess = async (e)  => {
    // button click on discovery content will request access
    const hash = e.currentTarget.id;
    const data_id = this.props.dataDict[hash];
    const contract = this.props.contract;
    const pubX = "0x0000000000000000000000000000000000000000000000000000000000000001";
    const pubY = "0x0000000000000000000000000000000000000000000000000000000000000001";
    await contract.methods.requestAccessWithKey(data_id,pubX,pubY).send({from:this.props.accounts[0]});
    this.props.onWeb3Change();

  }

  handleRequestCheckbox = (e) => {
    // store which checkbox is checked or unchecked
    const unique_id = [e.currentTarget.id];
    var requestCheckboxes = this.state.requestCheckboxes;
    // console.log('the unique id ' + unique_id);
    // console.log('is it checked? ' + e.currentTarget.checked);
    requestCheckboxes[unique_id]= e.currentTarget.checked;
    this.setState({requestCheckboxes:requestCheckboxes})
  }

  handleTextChange = (e) => {
      this.setState({ textcontent: e.target.value });
    }

  handleTitleChange = (e) => {
    this.setState({ titlecontent: e.target.value });
  }

  async handleSubmit(e) {
    if(e) {
      e.preventDefault();}
    
    // encryption of data first, returns a json data structure
    const JSONcontent = await this.encryptAndStuff(this.state.textcontent, this.state.titlecontent);
    // upload content to IPFS
    const IPFShash = await uploadObjectIpfs(JSONcontent);
    // console.log(' hash and ' + IPFShash.hash + 'url from uploading :' + IPFShash.url );

    // store IPFS location on blockchain
    const content1 = IPFSUtil.getBytes32FromMultiash(IPFShash.hash).digest
    await this.props.contract.methods.addContent(content1).send({from:this.props.accounts[0]});

    this.toggleModal("addContentModal");
    this.props.onWeb3Change();
    }

    async grantRequests(e) {
      // this will send a transaction for each request that was selected
      for (var checkbox in this.state.requestCheckboxes)  {
        if (this.state.requestCheckboxes[checkbox]) {
          // checkbox was selected at time of button click
          // granting request, for now same data location as no key mgt
          const user = this.props.pendingRequests[checkbox][1];
          const content = this.props.pendingRequests[checkbox][0];
          const ipfs = IPFSUtil.getBytes32FromMultiash(this.props.theContent[content][1]).digest;
          // console.log("user " + user );
          // console.log("content" + content);
          // console.log("ipfs " + ipfs);
          await this.props.contract.methods.grantAccess(user,content,ipfs).send({from:this.props.accounts[0]});
        } 
      }
      this.props.onWeb3Change();
      this.toggleModal("requestModal");
    }

    async rejectRequests(e) {
      // this will send a transaction for each request that was selected
      for (var checkbox in this.state.requestCheckboxes)  {
        if (this.state.requestCheckboxes[checkbox]) {
          // checkbox was selected at time of button click
          // granting request, for now same data location as no key mgt
          const user = this.props.pendingRequests[checkbox][1];
          const content = this.props.pendingRequests[checkbox][0];
          const ipfs = IPFSUtil.getBytes32FromMultiash(this.props.theContent[content][1]).digest;
          // console.log("user " + user );
          // console.log("content" + content);
          // console.log("ipfs " + ipfs);
          await this.props.contract.methods.refuseAccess(user,content).send({from:this.props.accounts[0]});
        } 
      }
      this.props.onWeb3Change();
      this.toggleModal("requestModal");
    }

    // setContent(e, data_id) {
    //   this.setState({fullContentSelected : data_id});
    //   this.toggleModal("fullContentModal",this.props.theContent[i][0]);
    // }

  async componentDidMount() {
    console.log('in ContentTabs componentDidMount')
    await this.props.onWeb3Change;
  }
  render() {
    console.log('in ContentTabs render')

    if (this.props.contractReady) {
      console.log('in ContentTabs render - contract is ready')

    // building owner items list
    const ownerItems = []
    if (this.props.owner === true) {
    for (let i=0;i<this.props.theContent.length;i++) {
      ownerItems.push(
      <li key={this.props.theContent[i][0]} 
      list-style-type="none"> 
      <Button onClick={() => this.toggleModal("fullContentModal",this.props.theContent[i][0])}>
      {this.props.allDataDict[i].metadata.title}
      </Button></li>)
    }
    if (ownerItems.length == 0) {
      ownerItems.push(<div>No content created yet</div>)
    }
  }
  else {
    ownerItems.push(<div>You do not own any content</div>)
  }

    // building requests items list
    var requestsItems = [];
      for (let i = 0; i < this.props.pendingRequests.length; i++) {
        const data_id = this.props.pendingRequests[i][0];
        // console.log('in request builgind, data_id : ' + data_id );
        requestsItems.push(
            <div className="custom-control custom-checkbox mb-3">
              <input
                className="custom-control-input"
                id={i}
                type="checkbox"
                onChange={() => this.handleRequestCheckbox}
              />
              <label className="custom-control-label" htmlFor={i}>
                <span>content: {this.props.allDataDict[data_id].metadata.title} user: {this.props.pendingRequests[i][1]}</span>
              </label>
            </div>
        )
      }
      if (requestsItems.length === 0) {
        requestsItems.push(<li id='noreqs'> No requests pending</li>)
      }


    // building list for the content that has been shared with the user
    var sharedItems = [];
    // console.log("in ContentTabs userContent " +this.props.userContent );
    if (this.props.owner === false) {
      for (let i=0;i<this.props.userContent.length;i++) {
        const data_id = this.props.dataDict[this.props.userContent[i][1]];
        sharedItems.push(
        <li key={this.props.userContent[i][0]}> 
        <Button onClick={(e) => this.setContent(e, data_id)}
        >{this.props.allDataDict[data_id].metadata.title}</Button>
        </li>)
      }
      if (sharedItems.length === 0) {
        sharedItems.push(<div>No content shared with you yet</div>)
      }
    }
    else {
      sharedItems.push(<div>As the owner you already have access to everything</div>)
    }

    // building items list for the user to discover 
    var toDiscoverItems = []
    if (this.props.owner === false) {
      for (let i=0;i<this.props.dataToDiscover.length;i++) {
        const data_id = this.props.dataDict[this.props.dataToDiscover[i][1]];
        toDiscoverItems.push(
        <li key={this.props.dataToDiscover[i][0]} 
        list-style-type="none"> 
        <Button id={this.props.dataToDiscover[i][1]} 
        onClick={() => this.requestAccess}
        >{this.props.allDataDict[data_id].metadata.title}</Button></li>)
        } 
      if (toDiscoverItems.length === 0) {
        toDiscoverItems.push(<div>No (more) content to be discovered</div>)
      }
    }
    else {
      toDiscoverItems.push(<div>As the owner you already have access to everything</div>)
    }

      return (
      <>
        <h3 className="h4 text-success font-weight-bold mb-4">Share your data securely leveraging Ethereum keys</h3>
        <Row className="justify-content-center">
          <Button 
          className="btn-1 ml-1" 
          color="primary" 
          type="button"
          disabled={!this.props.owner}
          onClick={() => this.toggleModal("addContentModal")} >
            New Content
          </Button>
          <Modal
              className="modal-dialog-centered"
              isOpen={this.state.addContentModal}
              toggle={() => this.toggleModal("addContentModal")}
            >
              <div className="modal-header">
                <h6 className="modal-title" id="modal-title-default">
                  New content
                </h6>
                <button
                  aria-label="Close"
                  className="close"
                  data-dismiss="modal"
                  type="button"
                  onClick={() => this.toggleModal("addContentModal")}
                >
                  <span aria-hidden={true}>×</span>
                </button>
              </div>
              <Form role="form" onSubmit={this.handleSubmit}>
              <div className="modal-body">
                <FormGroup>
                  <Label for="exampleText">Data to share</Label>
                  <Input type="textarea" placeholder="Enter title" name="text" id="title" onChange={this.handleTitleChange}/>
                  <Input type="textarea" placeholder="Enter something to share" name="text" id="maincontent" onChange={this.handleTextChange}/>
                </FormGroup>              
                </div>
              <div className="modal-footer">
                <Button 
                color="primary" 
                type="submit"
                value="Submit">
                  Encrypt and share
                </Button>
                <Button
                  className="ml-auto"
                  color="link"
                  data-dismiss="modal"
                  type="button"
                  onClick={() => this.toggleModal("addContentModal")}
                >
                  Close
                </Button>
              </div>
              </Form>
            </Modal>
            <Button 
            className="btn-1 ml-1" 
            color="primary" 
            type="button"
            disabled={!this.props.owner}
            onClick={() => this.toggleModal("requestModal")} >
              Manage requests
            </Button>
            <Modal
            className="modal-dialog-centered"
            isOpen={this.state.requestModal}
            toggle={() => this.toggleModal("requestModal")}
            >
              <div className="modal-header">
                <h6 className="modal-title" id="modal-title-default">
                  Pending requests
                </h6>
                <button
                  aria-label="Close"
                  className="close"
                  data-dismiss="modal"
                  type="button"
                  onClick={() => this.toggleModal("requestModal")}
                >
                  <span aria-hidden={true}>×</span>
                </button>
              </div>
              <Form role="form" onSubmit={() => this.handleSubmit}>
              <div className="modal-body">
                <FormGroup>
                {requestsItems}
                </FormGroup>              
                </div>
              <div className="modal-footer">
              <Button
                  className="ml-auto"
                  color="link"
                  data-dismiss="modal"
                  type="button"
                  onClick={() => this.grantRequests}
                >
                  Grant requests
                </Button>
                <Button
                  className="ml-auto"
                  color="link"
                  data-dismiss="modal"
                  type="button"
                  onClick={() => this.rejectRequests}
                >
                  Reject requests
                </Button>
                <Button
                  className="ml-auto"
                  color="link"
                  data-dismiss="modal"
                  type="button"
                  onClick={() => this.toggleModal("requestModal")}
                >
                  Close
                </Button>
              </div>
              </Form>
            </Modal>
            <FullContentModal
              key = "fullcontentModal"
              className="modal-dialog-centered"
              isOpen={this.state.fullContentModal}
              contractReady={this.props.contractReady} 
              allDataDict={this.props.allDataDict}
              contentSelected={this.state.contentSelected}
              ownerData={this.props.theContent}
              toggleFullModal={() => this.toggleModal("fullContentModal",this.state.contentSelected)}
               />
            <Button
            key="refreshWeb3Content"
              className="btn-1 ml-1"
              color="primary"
              type="button"
              onClick={() => this.props.onWeb3Change} >
              Refresh
          </Button>

        </Row>
        <Row className="justify-content-center">
          <Col lg="6">
            <div className="nav-wrapper">
              <Nav
                className="nav-fill flex-column flex-md-row"
                id="tabs-icons-text"
                pills
                role="tablist"
              >
                <NavItem>
                  <NavLink
                    aria-selected={this.state.iconTabs === 1}
                    className={classnames("mb-sm-3 mb-md-0", {
                      active: this.state.iconTabs === 1
                    })}
                    onClick={e => this.toggleNavs(e, "iconTabs", 1)}
                    href="#pablo"
                    role="tab"
                  >
                    <i className="ni ni-cloud-upload-96 mr-2" />
                    My own content
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    aria-selected={this.state.iconTabs === 2}
                    className={classnames("mb-sm-3 mb-md-0", {
                      active: this.state.iconTabs === 2
                    })}
                    onClick={e => this.toggleNavs(e, "iconTabs", 2)}
                    href="#pablo"
                    role="tab"
                  >
                    <i className="ni ni-bell-55 mr-2" />
                    Shared with me
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    aria-selected={this.state.iconTabs === 3}
                    className={classnames("mb-sm-3 mb-md-0", {
                      active: this.state.iconTabs === 3
                    })}
                    onClick={e => this.toggleNavs(e, "iconTabs", 3)}
                    href="#pablo"
                    role="tab"
                  >
                    <i className="ni ni-calendar-grid-58 mr-2" />
                    To discover
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
            <Card className="shadow">               
              <CardBody>
                <TabContent activeTab={"iconTabs" + this.state.iconTabs}>
                  <TabPane tabId="iconTabs1">
                    <div>{ownerItems}</div>
                  </TabPane>
                  <TabPane tabId="iconTabs2">
                    <div>{sharedItems}</div>
                  </TabPane>
                  <TabPane tabId="iconTabs3">
                    <div>{toDiscoverItems}</div>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
  else {
    console.log('in ContentTabs render - contract not ready')
    return (
      <>
        <h3 className="h4 text-success font-weight-bold mb-4">Share your data securely leveraging Ethereum keys</h3>
        <Row className="justify-content-center">
          <div>Contract not ready or readable</div>
          </Row>
      </>
      );
  }
}

}

export default TabsSection;
