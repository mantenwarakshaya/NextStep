import React, { Component } from "react";
import { ThreeDots } from "react-loader-spinner";
import "./index.css";

class LoaderView extends Component {
  render() {
    const { message = "Loading..." } = this.props;

    return (
      <div className="loader-container">
        <ThreeDots height="60" width="60" color="#0967d2" visible={true} />
        <p>{message}</p>
      </div>
    );
  }
}

export default LoaderView;
