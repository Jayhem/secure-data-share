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
 * This component displays all of the information for a given content in a modal.
 * The info comes from IPFS.
 * @component
 */

import React from "react";
import PropTypes from "prop-types"

// reactstrap components
import {
  Button,
  Modal
} from "reactstrap";
import { getIpfsUrl } from "../utils/ipfs";


class FullContentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {  fullContentSelected : 0 };

  // These bindings are necessary to make `this` work in the callbacks
//   this.newContent = this.newContent.bind(this);
}
   async componentDidMount() {
        if (this.props.contractReady) {
            console.log('In FullContentModal componentDidMount - contract ready')
        }
    }
    
  render() {
    // building list for the content that has been shared with the user
        // building full content modal
        console.log('In FullContentModal render');
        var fullContentModal = [];
        var that = this;
        if (this.props.contractReady && this.props.ownerData && this.props.allDataDict[0]) {
            console.log('In FullContentModal render - contract ready')
            console.log('In FullContentModal render - show that var')
            console.log(JSON.stringify(that.props))
            //console.log('In FullContentModal - allDataDict' + this.props.allDataDict[0].metadata.title);
            //   console.log('building modal, fullContentSelected value : ' + this.state.fullContentSelected);
        fullContentModal.push(
        <Modal
        className="modal-dialog-centered"
        isOpen={this.props.isOpen}
        >
          <div className="modal-header">
            <h6 className="modal-title" id="modal-title-default">
              {this.props.allDataDict[this.props.contentSelected].metadata.title}
            </h6>
            <button
              aria-label="Close"
              className="close"
              data-dismiss="modal"
              type="button"
              onClick={this.props.toggleFullModal}
            >
              <span aria-hidden={true}>×</span>
            </button>
          </div>
          <div className="modal-body">
              <p>{this.props.allDataDict[this.props.contentSelected].metadata.encrypted_data}</p>
              <a href = {getIpfsUrl(this.props.ownerData[this.props.contentSelected][1])}>
                See the complete information on IPFS
              </a>
          </div>
          <div className="modal-footer">
            <Button
              className="ml-auto"
              color="link"
              data-dismiss="modal"
              type="button"
              onClick={this.props.toggleFullModal}
            >
              Close
            </Button>
          </div>
        </Modal>)
        }
        else {
            console.log('In FullContentModal render - contract not ready')
            return null;    
        }
       
        
      return (
      <>
        {fullContentModal}
      </>
    );
  }
}

FullContentModal.propTypes = {
  /**
   * ownerData is the prop that contains the content owned by the owner. [[2]], with the content-id for each entry
   * and the IPFS hash of that content. It can be empty, as the owner may not have created any content.
   */
  ownerData: PropTypes.array.isRequired,
  /**
   * contractReady is a bool that informs about the readiness of the smart contract
   */
  contractReady: PropTypes.bool.isRequired,
  /**
   * contentSelected is a integer identifying the content currently selected by the user
   */
  contentSelected: PropTypes.number.isRequired,
  /**
   * allDataDict is dictionnary of the info related to the contents, with keys being the content-id.
   * It contains data that has been retrieved from IPFS by the calling component. The data
   * is diverse, it contains the encrypted content itself and the keys (encrypted) of all users that have access to this content.
   */
  allDataDict: PropTypes.object.isRequired,
  /**
   * toggleFullModal is a function passed in parameter that is used to toggle the modal
   */
  toggleFullModal: PropTypes.func.isRequired,
}

export default FullContentModal;
