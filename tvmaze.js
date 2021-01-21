// Link to generic show image
const GENERIC_URL = 'generic-tv.png'

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */
$("#search-form").on("submit", async function handleSearch(evt) {
  //don't refresh the page
  evt.preventDefault();
  //get the query from the DOM
  const query = $("#search-query").val();
  //if it's empty or there is an issue, abort
  if (!query) return;
  // hides the episode area
  $("#episodes-area").hide();
  //gets the shows from the api
  const shows = await searchShows(query);
  //adds the shows to the DOM
  populateShows(shows);
});

/** Handle Episode button press:
 *    - show episodes area
 *    - get list of episodes and show in episodes list
 */
$("#shows-list").on('click', '.epi-btn', async function showEpisodes(evt) {
  //get the showId from the card the pressed btn is in
  const showId = $(this).parent().parent().data().showId;
  //get episodes for the clicked show
  const episodes = await getEpisodes(showId);
  //add the episodes to the DOM
  populateEpisodes(episodes);
  //reveal the Episode section
  $episodeArea.show();
});


/**
 * given an array of shows, add shows to DOM
 *
 *     @param {[ {id,image,name,summary} ]} shows an array of "show" objects
 */

function populateShows(shows) {
  //grab the container for the shows
  const $showsList = $("#shows-list");
  //empty the HTML
  $showsList.empty();
  //for every show of shows, make a new card of the contents and add it to the DOM
  for (let show of shows) {
    let $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
         <div class="card" data-show-id="${show.id}">
         <img class="card-img-top" src="${show.image}">
           <div class="card-body">
             <h5 class="card-title">${show.name}</h5>
             <p class="card-text">${show.summary}</p>
             <button class="btn btn-secondary epi-btn">Episodes</button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($item);
  }
}

/**
 *  clears the episode area and appends each episode of episodes as an li to the ul
 *
 * @param { [{name,number,season}] } episodes an array of episode objects
 */
function populateEpisodes(episodes) {
  //gets the container for the episodes from the DOM
  const $episodeArea = $("#episodes-area");
  //empties the HTML
  $episodeArea.empty();
  //for every episode of episodes, add an li to the episode container
  for ({ name, number, season } of episodes) {
    const content = $(`<li>${name}(season${season}, episode${number})</li>`);
    $episodeArea.append(content);
  }

}


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async so it
 *       will be returning a promise.
 * @param {string} query the query to filter shows by
 *
 * @returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists>
      }
 */

async function searchShows(query) {
  //try to get a resource...
  try {
    const res = await axios.get('http://api.tvmaze.com/search/shows', { params: { q: query } });
    //the raw show data returned from the api
    const rawShows = res.data;
    //map just the useful data into the array shows
    const shows = rawShows.map(({ show }) => {
      //if the image object does NOT exist...
      if (!show.image) {
        //...create it
        show.image = {};
        //... and add a property to it that we will use later
        show.image.medium = GENERIC_URL;
      }
      //pull the desired properties from the show object
      const { id, name, summary, image: { medium: image } } = show;
      //return a new object with just those properties in it
      return { id, name, summary, image }
    });
    //return the array of formatted shows
    return shows;

  }
  // If the resource has an error, catch it and log it;
  catch (e) {
    console.log('Error On Search', e);
    return;
  }
}


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */
async function getEpisodes(id) {

  try {
    const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

    const episodes = res.data;
    const formatted = episodes.map(
      ({ id, name, number, season }) => ({ id, name, number, season })
    );
    return formatted;
  } catch (e) {
    console.log('Error On Search', e);
    return;
  }
}
