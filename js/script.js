$(document).ready(function() {


  // Al click sul bottone stampo i risultati della ricerca
  $('button.search-movie-btn').click(function() {
    // Metto il valore dell'input nella variabile (function line: 36)*
    var searchValue = searchMovieValue();

    // Chiamo il database di TMDb e visualizzo i risultati in base al valore della ricerca
    ajaxCall(searchValue);

    $('.select-container').removeClass('hidden')
  }); // End click on search-movie-btn


  // Premendo tasto enter stampo i risultati della ricerca
  $('.search-movie').keypress(function(event) {
    if (event.which === 13 ) {
      // Metto il valore dell'input nella variabile (function line: 36)*
      var searchValue = searchMovieValue();

      // Chiamo il database di TMDb e visualizzo i risultati in base al valore della ricerca
      ajaxCall(searchValue);

      $('.select-container').removeClass('hidden')
    } // End if
  }); // End keypress event




// ==============================================================
// ======================== FUNZIONI ============================

// ==============================================================
// Funzione searchMovie
// legge il valore dell'input .search-movie
// ---> Ritorna: valore dell'input
function searchMovieValue() {
    // Leggo il valore all'evento (click, keypress)
    var searchInputValue = $('input.search-movie').val();

    // Resetto il valore dell'input dopo l'evento (click, keypress)
    $('input.search-movie').val('');

    // Ritorno il valore dell'input
    return searchInputValue
}; // End funzione searchMovie

// ==============================================================
// Funzione ajaxCall
// TMDb: Chiave API (v3 auth)
// api_key: 345a41c08ec6d0c01364a6a7cd7a8052
// Interroga il database di Themoviedatabase.org e stampo i valori
// --->>> Argomento: variabile che è una stringa o un valore dell'input
function ajaxCall(valoreRicerca) {

  $.ajax(
    {
      url:"https://api.themoviedb.org/3/search/movie",
      method:"GET",
      data: {
        api_key:"345a41c08ec6d0c01364a6a7cd7a8052",
        query: valoreRicerca,
        page: 1,
        language: 'it-IT'
      },
      success: function(data) {
        var searchResults = data.results;
        console.log(searchResults)

        movieTamplate(searchResults);

        pageSelector(valoreRicerca);

      },
      error: function() {
        alert('ERRORE')
      }
    }
  ); // End ajax call

} // End function ajaxCall

// ==============================================================
// Function movieTamplate
// Con hendlebars compilo il tamplate
// --->>> Argomento: un array di oggetti che ottengo con la chiamata ajax
function movieTamplate(resultArray) {
  // Azzero i risultati della pagina qualora fossero presenti
  $('.show-results').html('');
  // Compilo il template
  var source = $('#movies-template').html();
  var template = Handlebars.compile(source);

  for (var i = 0; i < resultArray.length; i++) {
    // Metto nella variabile singolo oggetto dell'array
    var sinngleMovie = resultArray[i];
    // Metto nell'oggetto le chiavi del risultato e stamo i relativi valori
    var context = {
      "titolo": sinngleMovie.title,
      "titolo-originale": sinngleMovie.original_title,
      "uscita": sinngleMovie.release_date,
      "overview": sinngleMovie.overview,
      "voto_medio": sinngleMovie.vote_average,
      "anteprima": sinngleMovie.poster_path
    }

    var html = template(context);

    // Appendo il template compilato nel container apposito
    $('.show-results').append(html)
  }
}

// =============================================================

function pageSelector(valoreRicerca) {
  // Seleziono tag select
  var select = $('.page-selector');

  select.val(1)

  // Cambio valore dell'opzione del tag select
  select.change(function() {
    // Seleziono opzione del select
    selectOption = $(select).val();

    // Eliminato effetto terminator
    // ajaxCall(valoreRicerca, selectOption)
    $.ajax(
      {
        url:"https://api.themoviedb.org/3/search/movie",
        method:"GET",
        data: {
          api_key:"345a41c08ec6d0c01364a6a7cd7a8052",
          query: valoreRicerca,
          page: selectOption,
          language: 'it-IT'
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

  });
}



}) // end document ready
