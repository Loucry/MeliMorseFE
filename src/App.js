import React from 'react';
import './App.css';
import MorseService from './Service/MorseService';

class App extends React.Component {

  constructor(props) {
    super(props);
    this._isMounted = false;
    this.clear();
  }

  createOscillator = () => {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 700;
    gain.connect(context.destination);
    gain.gain.value = 0.3;
    oscillator.start(context.currentTime);

    this.context = context;
    this.oscillator = oscillator;
    this.gain = gain;
  }

  componentDidMount = () => {
    this._isMounted = true;
    this.input.focus();
    this.writeInterval = setInterval(this.writeBinaryInterval, 50);
  }
  componentWillUnmount = () => {
    this._isMounted = false;
    this.disconnectOscillator();
    clearInterval(this.writeInterval);
  }

  disconnectOscillator = () => {
    this.oscillator.stop(this.context.currentTime);
    this.gain.disconnect();
    this.oscillator.disconnect();
    this.context.disconnect();
    this.oscillator = null;
  }

  writeBinaryInterval = () => {
    if (this.writeStarted) {
      this.binary = this.binary.concat(this.binaryChar);

      if (!!this.lastKeyUp && !this.requestOngoing && this.binaryChar !== "1" && (Date.now() - this.lastKeyUp) > 2000) {
        this.translateBinary();
      }

      this.forceUpdate();
    }
  }

  translateBinary = async () => {
    this.requestOngoing = true;
    var binaryCopy = String(this.binary);
    this.binary = "";
    const response = await MorseService.translateBinary(binaryCopy, this.stats)
      .catch(this.resetWrite());

    if (!!response) {
      this.text = this.text.concat(response.text);
      this.morse = this.morse.concat(response.morse);
      this.stats = response.spaceStats;
    }
    this.resetWrite();
  }

  resetWrite = () => {
    this.requestOngoing = false;
    this.writeStarted = false;
    this.lastKeyUp = null;
    if (this._isMounted) {
      this.forceUpdate();
    }
  }

  onKeyUpHandler = (event) => {
    if (event.key === " " && this.binaryChar === "1") {
      this.binaryChar = "0";
      this.lastKeyUp = Date.now();
      this.writeStarted = true;
      this.oscillator.disconnect(this.gain)
    }
  }

  onKeyDownHandler = (event) => {
    if (!this.oscillator) {
      this.createOscillator();
    }
    if (event.key === " " && this.binaryChar === "0") {
      this.binaryChar = "1";
      this.writeStarted = true;
      this.oscillator.connect(this.gain)
    }
  }

  onChangeHandler = (event) => {
    event.target.value = "";
  }

  clear = () => {
    this.binaryChar = "0";
    this.binary = "";
    this.text = "";
    this.morse = "";
    this.stats = null;
    this.resetWrite();
    if (!!this.input) {
      this.input.focus();
    }
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={"http://www.codebug.org.uk/assets/steps/540/image_1.png"} />
          <p>
            {this.binary}
          </p>
          <p>
            {this.text}
          </p>
          <p>
            {this.morse}
          </p>
          <p>
            Press the spacebar to write the morse tone
          </p>
          <input
            autoFocus
            ref={(input) => this.input = input}
            onChange={this.onChangeHandler}
            onKeyDown={this.onKeyDownHandler}
            onKeyUp={this.onKeyUpHandler} />

          <button onClick={this.clear}>clear</button>
        </header>
      </div>
    );
  }
}

export default App;
