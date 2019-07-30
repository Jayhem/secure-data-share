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

class ContentTable extends React.Component {
    render() {
      if (this.props.content.length === 0) {
        return (
          <Card className="shadow">
            <CardBody>
              <TabContent activeTab={this.props.activeTab}>
                <TabPane tabId="noContent">
                  <p className="description">
                    You are not sharing any content. Try it by clicking on the
                    Share content button!
                  </p>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card >)
      }
      else {
        return ( <TabPane tabId="noContent">
        <p className="description">
          Here is where the content should appear
        </p>
      </TabPane>);

      }
    }
}

class TabsSection extends React.Component {
  constructor(props) {
    super(props);
  this.state = {
    iconTabs: 1,
    OwnerContent: this.props.theContent,
    userContent: this.props.userContent,
    owner: this.props.owner
  };
  // This binding is necessary to make `this` work in the callback
  this.handleSubmit = this.handleSubmit.bind(this);
  this.handleTextChange = this.handleTextChange.bind(this);
}
  toggleNavs = (e, state, index) => {
    e.preventDefault();
    this.setState({
      [state]: index
    });
  };

  toggleModal = state => {
    this.setState({
      [state]: !this.state[state]
    });
  };

  encryptAndStuff = (formdata) => {
    console.log('the form data is : ' + formdata);

  }

  handleTextChange = (e) => {
    
      this.setState({ textcontent: e.target.value });
    }

  handleSubmit(e) {
    if(e) {
      e.preventDefault();}
    
    // encryption of data first
    this.encryptAndStuff(this.state.textcontent);
    this.toggleModal("defaultModal");
    }

  render() {

    const items = []
    for (let i=0;i<this.props.theContent.length;i++) {
      items.push(<li key={this.props.theContent[i][0]}> <Button >{this.props.theContent[i][1]}</Button></li>)
    }

    return (
      <>
        <h3 className="h4 text-success font-weight-bold mb-4">Share your data securely leveraging Ethereum keys</h3>
        <Row className="justify-content-center">
          <Button 
          className="btn-1 ml-1" 
          color="primary" 
          type="button"
          onClick={() => this.toggleModal("defaultModal")} >
            New Content
          </Button>
          <Modal
              className="modal-dialog-centered"
              isOpen={this.state.defaultModal}
              toggle={() => this.toggleModal("defaultModal")}
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
                  onClick={() => this.toggleModal("defaultModal")}
                >
                  <span aria-hidden={true}>×</span>
                </button>
              </div>
              <Form role="form" onSubmit={this.handleSubmit}>
              <div className="modal-body">
                <FormGroup>
                  <Label for="exampleText">Data to share</Label>
                  <Input type="textarea" placeholder="Enter something to share" name="text" id="exampleText" onChange={this.handleTextChange}/>
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
                  onClick={() => this.toggleModal("defaultModal")}
                >
                  Close
                </Button>
              </div>
              </Form>
            </Modal>
          <Button className="btn-1 ml-1" color="primary" type="button">
            Manage requests
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
                    <div>{items}</div>
                    <div>{this.props.OwnerContent}</div>
                  </TabPane>
                  <TabPane tabId="iconTabs2">
                    <p className="description">
                      Cosby sweater eu banh mi, qui irure terry richardson ex
                      squid. Aliquip placeat salvia cillum iphone. Seitan
                      aliquip quis cardigan american apparel, butcher voluptate
                      nisi qui.
                    </p>
                  </TabPane>
                  <TabPane tabId="iconTabs3">
                    <p className="description">
                      Raw denim you probably haven't heard of them jean shorts
                      Austin. Nesciunt tofu stumptown aliqua, retro synth master
                      cleanse. Mustache cliche tempor, williamsburg carles vegan
                      helvetica. Reprehenderit butcher retro keffiyeh
                      dreamcatcher synth.
                    </p>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}

export default TabsSection;
