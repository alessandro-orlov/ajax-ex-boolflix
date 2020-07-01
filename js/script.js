// TMDb: Chiave API (v3 auth)
// 345a41c08ec6d0c01364a6a7cd7a8052
$(document).ready(function() {


  // Al click prendo il valore dell'input value
  $('button.search-movie-btn').click(function() {

    var searchValue = searchMovieValue();
    console.log(searchValue);

    ajaxCall(searchValue);

  }); // End click on search-movie-btn


  // Premendo tasto enter stampo i risultati della ricerca
  $('.search-movie').keypress(function(event) {
    if (event.which === 13 ) {

      var searchValue = searchMovieValue();

      ajaxCall(searchValue);

    }
  });



// ======================================================
// =================== FUNZIONI =========================

// Funzione searchMovie
// al click sul button legge il valore dell'input .search-movie
// ---> ritorna: valore input
function searchMovieValue() {

    var searchInput = $('input.search-movie');

    // Leggo il valore al click
    var searchInputValue = searchInput.val();

    // Resetto il valore dopo il click
    searchInput.val('')

    return searchInputValue

}; // End funzione searchMovie

// Funzione chiamata ajax
function ajaxCall(valoreRicerca) {

  $.ajax(
    {
      url:"https://api.themoviedb.org/3/search/movie",
      method:"GET",
      data: {
        api_key:"345a41c08ec6d0c01364a6a7cd7a8052",
        query: valoreRicerca,
      },
      success: function(data) {
        var searchResults = data.results;
        console.log(searchResults)

        movieTamplate(searchResults);

      },
      error: function() {
        alert('ERRORE')
      }

    }
  ); // End ajax call

} // End function ajaxCall


// Function movieTamplate
function movieTamplate(resultArray) {
  $('.show-results').html('')
  var source = $('#movies-template').html();
  var template = Handlebars.compile(source);

  for (var i = 0; i < resultArray.length; i++) {
    var sinngleMovie = resultArray[i];
    var html = template(sinngleMovie);

    $('.show-results').append(html)
  }
}










}) // end document ready
