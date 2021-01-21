const GENERIC_URL = 'generic-tv.png'

/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */



/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async so it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */

async function searchShows(query) {
  try {
    const res = await axios.get('http://api.tvmaze.com/search/shows',
      {
        params: {
          q: query
        }
      });

    const rawShows = res.data;
    const shows = rawShows.map(({ show }) => {
      if (!show.image) {
        show.image = {};
        show.image.medium = GENERIC_URL;
      }
      const { id, name, summary, image: { medium: image } } = show;
      return { id, name, summary, image }
    });
    return shows;

  }
  catch (e) {
    console.log('Error On Search', e);
    return;
  }
}


/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

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


function populateEpisodes(episodes) {
  console.log(episodes);
  const $episodeArea = $("#episodes-area");
  for (episode of episodes) {
    const content = $(`<li>${episode.name}</li>`);
    $episodeArea.append(content);
  }

  $episodeArea.show();

}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});

$("#shows-list").on('click', '.epi-btn', async function showEpisodes(evt) {
  const showId = $(this).parent().parent().data().showId;
  const episodes = await getEpisodes(showId);
  populateEpisodes(episodes);
});
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
