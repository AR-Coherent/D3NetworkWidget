import { Component, createElement } from "react";

import Network from "./components/D3NetworkJSON";

export default class ReactDDDjs extends Component {
    render() {
        if( this.props.nodes.status === "available" && 
            this.props.links.status === "available"){
            return <Network
                        nodes={this.props.nodes}
                        nodeID={this.props.nodeID}
                        nodeName={this.props.nodeName}
                        nodeRepulsion={this.props.nodeRepulsion}
                        nodeShape={this.props.nodeShape}
                        nodeWidth={this.props.nodeWidth}
                        nodeHeight={this.props.nodeHeight}
                        nodeStyle={this.props.nodeStyle}
                        nodeClick={this.props.nodeClick}
                        links={this.props.links}
                        linkSourceID={this.props.linkSourceID}
                        linkTargetID={this.props.linkTargetID}
                        linkStyle={this.props.linkStyle}
                        networkWidth={this.props.networkWidth}
                        networkHeight={this.props.networkHeight}
                        widgetName={this.props.name}
                        />;
        }
        else{
            return null
        }
    }
}
