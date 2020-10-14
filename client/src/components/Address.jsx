/* inspired by https://github.com/austintgriffith/scaffold-eth */

import React, {Component} from "react";
import Blockies from "react-blockies";
import ENS from "ethereum-ens";
import PropTypes from 'prop-types';

/**
 * This component displays an ethereum address and its blockie.
 * If the address resolves through ENS to a domain name it will display it instead.
 * @component
 */

 class Address extends Component {
  state = { reverseName : ""  }
  async componentDidMount () {
    try {
    const netId = await this.props.web3.eth.net.getId();
    console.log(netId);
    let ens = null;
    let ensProvider = (this.props.web3).currentProvider;
    // I'm assessing whether it is a network with ENS deployed or not by looking at the network ID
    // I looked at the ens-js code and that is what they do too
    if (netId > 5) {
      // This address is where the ENS contract is deployed on Ganache, it changes every time
      // I have deployed it as part of a different project because of the compilers difference
      // look in the logs after having deployed THAT project : ENS address
      const ensAddr = "0xFE987c757F7E2048F074BE9F4dA17713F5cFF1E8";
      ens =  new ENS(ensProvider,ensAddr);
    }
    else {
      ens =  new ENS(ensProvider);
    }
    
    const testAddr = "0x004D5B83e7Be6E8FaB67184E53cf01198E6ad0F8"
    //const reverseName = await ens.reverse(testAddr.slice(2)).name(); 
    const reverseName = await ens.reverse(this.props.value.slice(2)).name();
    console.log('Reverse-Name for:', this.props.value.slice(2), 'is', reverseName);
    this.setState({ reverseName: reverseName});
    }
    catch (error) {
    console.log(error)
  }
  }
  render() {
  let displayAddress = this.props.value.substr(0, 6);
  if (this.state.reverseName) {
    displayAddress = this.state.reverseName;
  }
  console.log('what is the display address?')
  console.log(JSON.stringify(displayAddress))
    return (     
    <div>
      <span style={{ verticalAlign: "middle" }}>
        <Blockies seed={this.props.value.toLowerCase()} size={8} scale={this.props.fontSize?this.props.fontSize/7:4} />
      </span>
      <span style={{ verticalAlign: "middle", paddingLeft: 5, fontSize: this.props.fontSize?this.props.fontSize:28 }}>{displayAddress}</span>
    </div> );
  }
}


Address.propTypes = {
  /**
   * value is the prop that contains the Ethereum address
   * it is a 40 character hexadecimal value, prepended with 0x
   */
  value: PropTypes.string.isRequired,
  /**
   * web3 is the web3 object provided by web3.js 
   * it is needed to call ENS and to figure out which network is currently selected
   */
  web3: PropTypes.object.isRequired
}


export default Address;
