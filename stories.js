import fetch from 'node-fetch';

export const getFrontPage = () => {
    return fetch('http://api.nextgen.guardianapps.co.uk/uk/lite.json')
    .then(data => data.json())
    .then(json => {
        return json.collections
    })
    .catch(e => console.log(e))
}

const fetchFromApis = () => {
    //Fetches top post URLs from Ophan, then post info from CAPI
    const ophanPostsArray = this.fetchPostsFromOphan();
    //Ophan returns an array of objects including a url and total users integer
    ophanPostsArray.then(results => this.convertToCapiUrlArray(results.map(item => item.url)))
    .then(data => this.fetchCapiData(data))
    .then(capiData => this.setState({topPosts: capiData}))
}
  
const fetchPostsFromOphan = () => {
    return fetch('https://api.ophan.co.uk/api/mostread/'+this.props.content+'?count=10')
    .then(response => response.json())
    .catch()
}
  
const fetchCapiData = (urls) => {
    return Promise.all(urls.map(url => {
    return fetch(url)
        .then(results => results.json())
        .then(data => data.response.content) // <---- wrap setState inside callback
        .catch()
    }
    ))
}
  
const exampleDate = "2020-01-29T06:34:47Z";

const convertToCapiUrlArray = (ophanUrlArray) => {
    return ophanUrlArray.map(x => x.replace('www.theguardian','content.guardianapis') + '?show-elements=all&api-key=gnm-hackday-21')
}

const convertUtcToDate = (datestring) => {
    let date = new Date(datestring);
    return (date.toDateString() + " | " + date.toLocaleTimeString())
}
// Take URL, strip theguardian.com from it. Add the end string on to CAPI URL