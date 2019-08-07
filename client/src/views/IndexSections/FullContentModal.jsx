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

// reactstrap components
import {
  Button,
  Modal
} from "reactstrap";


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
        var fullContentModal = []
        if (this.props.contractReady) {
            console.log('In FullContentModal render - contract ready')
            console.log('In FullContentModal - allDataDict' + this.props.allDataDict[0].metadata.title);
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
            <p>
            {this.props.allDataDict[this.props.contentSelected].metadata.encrypted_data}
            </p>
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

export default FullContentModal;
