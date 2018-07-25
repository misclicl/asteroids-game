class Sound {
  constructor(args) {
    const params = Object.assign({}, Sound.defaults, args);

    this.volume = params.volume;
    this.maxStreams = params.maxStreams;
    this.src = params.src;

    this.currentStream = 0;
    this.streams = [];

    const maxStreams = this.maxStreams;

    for (let index = 0; index < maxStreams; index++) {
      const audio = new Audio(this.src);
      audio.volume = this.volume;
      this.streams.push(audio);
    }
    console.log(this.src);
  }
  play() {
    this.currentStream = (this.currentStream + 1) % this.maxStreams;
    this.streams[this.currentStream].play();
  }
}

Sound.defaults = {
  maxStreams: 5,
  volume: 1,
};

export default Sound;
