import { Component, createElement } from "react";

import App from "./components/InteractiveD3";
import Network from "./components/D3NetworkJSON";
import "./ui/ReactDDDjs.css";

export default class ReactDDDjs extends Component {
    render() {

        if(this.props.nodes.status === "available" && this.props.links.status === "available"){
            console.log(this)
            return <Network
            nodes={this.props.nodes}
            nodeID={this.props.nodeID}
            nodeName={this.props.nodeName}
            links={this.props.links}
            linkSourceID={this.props.linkSourceID}
            linkTargetID={this.props.linkTargetID}
            networkWidth={this.props.networkWidth}
            networkHeight={this.props.networkHeight}
            widgetName={this.props.name}
            />;
        }
        else{
            return null
        }
        //return <App></App>;
    }
}
