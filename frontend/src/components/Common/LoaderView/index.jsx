import React, { Component } from "react";
import { ThreeDots } from "react-loader-spinner";
import "./index.css";

class LoaderView extends Component {
  render() {
    const { message = "Loading...", className = "" } = this.props;

    return (
      <div
        className={`loader-container ${className}`.trim()}
        role="status"
        aria-live="polite"
      >
        <div className="loader-mark" aria-hidden="true">
          <ThreeDots height="48" width="48" color="#2a4fcb" visible={true} />
        </div>
        <p className="loader-text">{message}</p>
      </div>
    );
  }
}

export default LoaderView;
