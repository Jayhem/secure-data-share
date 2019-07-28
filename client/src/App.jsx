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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ownerData: [], userData : [], web3: null, accounts: null, contract: null };
  // state = { web3: null, accounts: null, contract: null };
  }

  render() {
    return (
      <div className="App">
      <section className="section section-components">
            <Container>
              <ContentTabs theContent = {this.state.ownerData}/>
            </Container>
      </section>
        <div>The stored value is: {this.state.storageValue}</div>
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
      // example of interacting with the contract's methods.
      this.setState({ web3:web3, accounts:accounts, contract: instance }, this.getContent);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  async getContent() {
    const { accounts, contract } = this.state;

    // Get the data index from the contract
    const data_index = await contract.methods.data_index().call();

    // Get the data IPFS location for every datum
    var ownerDataConst = [];
    for (var i = 0; i < data_index; i++) {
      const location = await contract.methods.getDataLocation(i).call({from:accounts[0]} );
      const curr_cont = [i,location];
      ownerDataConst[i] = curr_cont;
    }


    // Update state with the result.
    this.setState({ ownerData: ownerDataConst });
  };
}
export default App;
