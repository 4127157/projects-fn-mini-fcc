'use strict';

class RandomQuotes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: "",
      curr: "",
      isLoaded: false
    };
    this.getRandomNum = getRandomNum.bind(this);
    this.handleQuoteClick = this.handleQuoteClick.bind(this);
    this.setColors = setColors.bind(this);
    
    this.grabBGColor = grabBGColor.bind(this);
  }

  componentDidMount() {
    {
      /*here what i have to do is insert the
       *code to get a random quote*/
      axios
        .get(
          "https://raw.githubusercontent.com/4127157/quotesGenFiles/main/quotes.json"
        )
        .then((response) => {
          this.setState({
            data: response.data,
            curr: this.getRandomNum(response.data.length),
            isLoaded: true
          });
        });
    }
  }
  componentWillUnmount() {}
  // componentDidUpdate(){
  // }

 //Gets a random number from the items and puts out what is at that location. Changes the background colour for each code.
  handleQuoteClick(e) {
    e.preventDefault();
    this.setState({
      curr: this.getRandomNum(this.state.data.length)
    });
    this.setColors();
    //Change the text in the Grab Color button which would not change without this unless refreshed.
    document.getElementById("grab-col-btn").innerHTML = "Grab Color";
  }


  render() {
    return (
      <div id="quote-box">
        <div id="quote-box-text">
        <QuoteText
          quote={
            this.state.isLoaded
              ? this.state.data[this.state.curr].content
              : "Loading..."
          }
        />

        <QuoteAuthor
          author={
            this.state.isLoaded
              ? this.state.data[this.state.curr].author
              : "Loading..."
          }
        />
        </div>
        {this.state.isLoaded && (
          <Buttons
            refLink={
              this.state.data[this.state.curr].content +
              " -" +
              this.state.data[this.state.curr].author
            }
            funcQuote={this.handleQuoteClick}
            colorGrab={this.grabBGColor}
          />
        )}
      </div>
    );
  }
}


function QuoteText(props) {
  return (
    <div id="quote-text">
      <span id="text">{props.quote}</span>
    </div>
  );
}

function QuoteAuthor(props) {
  return (
    <div id="quote-author">
      - <span id="author">{props.author}</span>
    </div>
  );
}

function Buttons(props) {
  //This was the least complicated way of handling the making of the tweet link. refLink prop is a preformatted verbose string that needs to be encoded for web URL.
  let f =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(props.refLink);

  //Code that grabs the current background color and copies it to the clipboard. 
  const loler = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(grabBGColor());
    document.getElementById("grab-col-btn").innerHTML = "Copied to Clipboard!";
  };
  
  return (
    <div id="buttons">
      <a href="#">
        <button className="button" id="new-quote" onClick={props.funcQuote}>
          New Quote
        </button>
      </a>

      <a href={f} target="_top" title="Tweet this quote" id="tweet-quote">
        <button className="button" >
          Tweet
        </button>
      </a>
      <button className="button" id="grab-col-btn" onClick={loler}>
        Grab Color
      </button>
    </div>
  );
}

//Generates a random number within an input, rounded int.
function getRandomNum(limit) {
  return Math.floor(Math.random() * limit);
}

//Generates random colors for the background
function generateColors() {
  let rgb = [];
  let i = 0;
  while (i != 3) {
    let color = Math.floor(Math.random() * 255);
    if (color >= 10) {
      rgb.push(color);
      i++;
    }
  }
  return rgb;
}


function setColors() {
  let rgb = generateColors();
  let maxColor = (Math.max(...rgb) / 255) * 100;
  let minColor = (Math.min(...rgb) / 255) * 100;
  
  //Text color depends on the ligthness of the background colour, this is not the best way to do this as lightness or luminosity is not the best measure of how contrasting the colour is to another colour, especially in this case. WebAIM guidelines regarding this matter should be taken as the standard, ideally. 
  let lightness = Math.floor((maxColor + minColor) / 2);
  document.body.style.background = "rgb(" + [...rgb] + ")";
  if (lightness <= 57) {
    document.body.style.color = "white";
  } else {
    document.body.style.color = "black";
  }
}

//Grabs the RGB background of the body and returns hex

function grabBGColor() {
  let color = document.body.style.background;
  let nums = [];
  let num = "";
  //Putting all the numbers from the rgb(x,y,z) string to array as numbers so it becomes [int,int,int] instead
  for (i in color) {
    if (color[i] >= "0" && color[i] <= "9") {
      num = num + "" + color[i];
    }
    if (color[i] == "," || color[i] == ")") {
      nums.push(parseInt(num));
      num = "";
    }
  }

  //Have not much idea what the .toString(16) is doing here but basically converts each number to hex in the array then joins together with a # and this is the string returned
  let finalHex =
    "#" +
    nums
      .map((item) => {
        let hex = item.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");
  return finalHex;
}

setColors();
ReactDOM.render(<RandomQuotes />, document.getElementById("wrapper"));

