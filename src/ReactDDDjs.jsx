import { Component, createElement } from "react";

import App from "./components/InteractiveD3";
import Network from "./components/D3NetworkJSON";
import "./ui/ReactDDDjs.css";

export default class ReactDDDjs extends Component {
    render() {

        if(this.props.nodes.status === "available" && this.props.links.status === "available"){
            console.log("render")
            return <Network
            nodes={this.props.nodes}
            nodeName={this.props.nodeName}
            links={this.props.links}
            linkSource={this.props.linkSource}
            linkTarget={this.props.linkTarget}
            />;
        }
        else{
            return null
        }
        //return <App></App>;
    }
}
