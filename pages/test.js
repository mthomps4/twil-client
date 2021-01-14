import axios from "axios";
import { useState } from "react";

const Test = (props) => {
  const [token, setToken] = useState(null);
  const [callStatus, setCallStatus] = useState("Please setup device.");
  const [callConnected, setCallConnected] = useState(false);
  const [phone, setPhone] = useState(null);

  // AUTH
  const makeToken = async () => {
    const url = "http://localhost:6001/api/v1/auto-dialer/voice/generate-token";
    const data = {
      memberId: "asdfqwerty",
    };

    await axios
      .post(url, {
        data,
      })
      .then((res) => {
        console.log({ res });
        const {
          data: { token },
        } = res;

        setToken(token);
      })
      .catch((e) => console.error(e));
  };

  const setupDevice = () => {
    const Device = require("twilio-client").Device;
    if (!token) return;

    const device = new Device(token, {
      debug: true,
      warnings: true,
      codecPreferences: ["opus", "pcmu"],
      fakeLocalDTMF: true,
      enableRingingState: true,
    });

    device.on("ready", function (device) {
      console.log("Twilio.Device Ready!");
      setCallStatus("Ready");
    });

    device.on("warning", function (warningName, warningData) {
      console.warn({ warningName, warningData });
      setCallStatus("Warning: " + warningName);
    });

    device.on("error", function (error) {
      console.error("Twilio.Device Error: " + error.message);
      setCallStatus("ERROR: " + error.message);
    });

    device.on("connect", function (conn) {
      console.log("Successfully established call!");
      // hangUpButton.prop("disabled", false);
      // callCustomerButtons.prop("disabled", true);
      // callSupportButton.prop("disabled", true);
      // answerButton.prop("disabled", true);

      // If phoneNumber is part of the connection, this is a call from a
      // support agent to a customer's phone
      const {
        message: { phoneNumber },
      } = conn;

      setCallConnected(true);
      if (phoneNumber) {
        setCallStatus("Connected to " + phoneNumber);
      } else {
        setCallStatus("Connected to member.");
      }
    });

    device.on("disconnect", function (conn) {
      // Disable the hangup button and enable the call buttons
      // hangUpButton.prop("disabled", true);
      // callCustomerButtons.prop("disabled", false);
      // callSupportButton.prop("disabled", false);

      setCallStatus("Ready");
      setCallConnected(false);
    });

    device.on("incoming", function (conn) {
      setCallStatus("Incoming support call");

      // Set a callback to be executed when the connection is accepted
      conn.accept(function () {
        setCallStatus("In call with customer");
      });

      // let answerButton;
      // // Set a callback on the answer button and enable it
      // answerButton.click(function () {
      //   conn.accept();
      // });
      // answerButton.prop("disabled", false);
    });

    setPhone(device);
  };

  const callCustomer = (phoneNumber) => {
    if (!phone) return;
    setCallStatus("Calling " + phoneNumber + "...");
    const params = { phoneNumber: phoneNumber };

    phone.connect(params);
  };

  const disconnect = () => {
    if (!phone) return;
    phone.disconnectAll();
  };

  return (
    <div style={{ margin: "2rem" }}>
      <h1>Test</h1>

      {!token && <button onClick={makeToken}>Generate Token</button>}

      {token && callStatus !== "Ready" && (
        <button onClick={() => setupDevice()}>Setup Device</button>
      )}

      {callStatus == "Ready" && (
        <button onClick={() => callCustomer("+YO PHONE")}>Call Member</button>
      )}

      {token && callConnected && (
        <button onClick={() => disconnect()}>Hang Up!</button>
      )}

      {token && (
        <div>
          <p>Call Status: {callStatus} </p>
        </div>
      )}
    </div>
  );
};
export default Test;
