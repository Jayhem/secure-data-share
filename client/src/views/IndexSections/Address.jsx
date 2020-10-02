/* inspired by https://github.com/austintgriffith/scaffold-eth */

import React, {Component} from "react";
import Blockies from "react-blockies";
import ENS from "ethereum-ens";

/*

  Displays an address with a blockie, links to a block explorer, and can resolve ENS

  <Address
    value={address}
    ensProvider={mainnetProvider}
    web3
    fontSize={optional_fontSize}
  />

*/

 class Address extends Component {
  state = { reverseName : ""  }
  async componentDidMount () {
    try {
    const netId = await this.props.web3.eth.net.getId();
    console.log(netId);
    let ens = null;
    if (netId > 5) {
      // This address is where the ENS contract is deployed on Ganache, it changes every time
      // I have deployed it as part of a different project because of the compilers difference
      // look in the logs after having deployed THAT project : ENS address
      const ensAddr = "0x44FDe5f511DF3322C35Ed9213f8383161019FA2D";
      ens =  new ENS(this.props.ensProvider,ensAddr);
    }
    else {
      ens =  new ENS(this.props.ensProvider);
    }
    
    const testAddr = "0xE752B30ED8898DC08c9A798457B8BCF089676CE8"
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
export default Address;
