import axios from "axios";
import { useState } from "react";

const Test = (props) => {
  const [token, setToken] = useState(null);
  const [callStatus, setCallStatus] = useState("Connecting to Twilio...");
  const [phone, setPhone] = useState(null);

  const makeToken = async () => {
    const url = "http://localhost:6001/api/v1/test-token";
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

    device.on("error", function (error) {
      console.log("Twilio.Device Error: " + error.message);
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

    const params = { to: phoneNumber };

    phone.connect(params);
  };

  const disconnect = () => {
    if (!phone) return;
    phone.disconnectAll();
  };

  return (
    <div style={{ margin: "2rem" }}>
      <h1>Test</h1>

      <button onClick={makeToken}>Make Token</button>

      <p>Call Status: {callStatus} </p>

      {token && <button onClick={() => setupDevice()}>Reset Device</button>}

      {callStatus == "Ready" && (
        <button onClick={() => callCustomer("+16062693492")}>
          Call Member
        </button>
      )}

      {callStatus !== "Ready" && (
        <button onClick={() => disconnect()}>Hang Up!</button>
      )}
    </div>
  );
};
export default Test;
