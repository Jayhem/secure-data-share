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

/**
 * This component is a simple button that allows to pause the smart contract and unpause it.
 * Only the contract owner is allowed to perform these operations, this is reflected in the UI.
 * @component
 * />
 */

import React from "react";
import PropTypes from "prop-types";

// reactstrap components
import {
  Button,
} from "reactstrap";


class PauseButton extends React.Component {
  constructor(props) {
    super(props);
  this.state = {
    buttonText: {false:"Pause", true:"Unpause"}
  };

  // These bindings are necessary to make `this` work in the callbacks
  this.handlePause = this.handlePause.bind(this);
}
  handlePause = async state => {
    // var buttonText = "Pause";
    console.log(JSON.stringify(this.props.contract))
    if (this.props.paused) {
        console.log("the contract is paused, I am unpausing it")
    await this.props.contract.methods.unpause().send({from:this.props.accounts[0]});
    }
    else {
        console.log("the contract is not paused, I am pausing it")
        await this.props.contract.methods.pause().send({from:this.props.accounts[0]});
     }
    await this.props.onWeb3Change();
    // console.log("in handlePause after onWeb3Change, paused props : " + this.props.paused)

    // if (this.props.paused) {
    //     buttonText = "Unpause";}
    // this.setState({
    //     buttonText: buttonText
    //   });
  
    
  };


  render() {
      return (
      <>
          <Button 
          className="btn-1 ml-1" 
          color="primary" 
          type="button"
          disabled={!this.props.owner}
          onClick={this.handlePause} >
            {this.state.buttonText[this.props.paused]}
          </Button>
      </>
    );
  }
}

PauseButton.propTypes = {
  /**
   * Paused is used to tell the button if the contract is paused or not.
   * This value comes from the contract, and is populated by the calling 
   * component in charge of maintaining the proper state from the smart contract.
   */
  paused: PropTypes.bool.isRequired,
  /**
   * web3 is the web3 object provided by web3.js 
   * it is needed to call the contract methods to pause/unpause contract
   */
  web3: PropTypes.object.isRequired,
  /**
   * accounts is an array of Ethereum addresses that have access to the site.
   * It is provided by the web3.js generated object (Ethereum interface), so technically it is redundant to have both
   */
  accounts: PropTypes.array.isRequired,
  /**
   * Contract is an object that contains all the necessary info to interact with the Ethereum contract.
   * The contract specifically is the datashare.sol as can be found in the contracts directory of this project.
   */
  contract: PropTypes.object.isRequired,
    /**
   * contractReady is a boolean that states whether the contract info can be retrieved.
   * This is important for rendering the data properly.
   */
  contractReady: PropTypes.bool.isRequired,
    /**
   * owner is a boolean that says if the current Ethereum address is the owner
   */
  owner: PropTypes.bool.isRequired,
    /**
   * disabled is a boolean that says if the button is grayed out (it is the opposite of what it says)
   */
  disabled: PropTypes.bool.isRequired,
    /**
   * onWeb3Change is a function that belongs to the calling component. It allows this tab component to tell the calling component that something
   * has changed in the state of the contract and that it should reload it, so that rendering can occur with up-to-date data.
   */
  onWeb3Change: PropTypes.func.isRequired
}
export default PauseButton;
