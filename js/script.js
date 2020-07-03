$(document).ready(function() {

  // Al click sul bottone stampo i risultati della ricerca
  $('button.search-movie-btn').click(function() {
    // // Resetto la pagina prima di stampore risultati
    // resetSearchResult();

    // Metto il valore dell'input nella variabile (function line: 36)*
    var searchValue = searchMovieValue();

    // Chiamo il database di TMDb e visualizzo i risultati in base al valore della ricerca
    ajaxCall(searchValue);

  }); // End click on search-movie-btn


  // Premendo tasto enter stampo i risultati della ricerca
  $('.search-movie').keypress(function(event) {
    if (event.which === 13 ) {
      // // Resetto la pagina prima di stampore risultati
      // resetSearchResult();

      // Metto il valore dell'input nella variabile (function line: 36)*
      var searchValue = searchMovieValue();

      // Chiamo il database di TMDb e visualizzo i risultati in base al valore della ricerca
      ajaxCall(searchValue);

    } // End if event.which
  }); // End keypress event



// ==============================================================
// ======================== FUNZIONI ============================
// ==============================================================

// ==================== searchMovie() ===========================
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
// --------------------------------------------------------------

// ==================== ajaxCall() ==============================
// Funzione ajaxCall
// TMDb: Chiave API (v3 auth)
// api_key: 345a41c08ec6d0c01364a6a7cd7a8052
// Interroga il database di Themoviedatabase.org e stampo i valori
// --->>> Argomento: variabile che è una stringa o un valore dell'input
function ajaxCall(valoreRicerca) {

  $.ajax(
    {
      url:"https://api.themoviedb.org/3/search/multi",
      method:"GET",
      data: {
        api_key:"345a41c08ec6d0c01364a6a7cd7a8052",
        query: valoreRicerca,
        page: 1,
        language: 'it-IT'
      },
      success: function(data) {
        var searchResults = data.results;
        console.log(searchResults);

        if(searchResults.length > 0) {
          resetSearchResult();

          movieTamplate(searchResults);

          pageSelector(valoreRicerca);

          filmHover();

          $('.select-container').removeClass('hidden');
        } else {
          resetSearchResult();

          var noResultsMessage = "La ricerca non ha prodotto risultati";
          printMessage(noResultsMessage);

          $('.select-container').addClass('hidden');
        }
      },
      error: function() {
        resetSearchResult();

        var errore = "Qualcosa non torna";
        printMessage(errore);

        $('.select-container').addClass('hidden');
      }
    }
  ); // End ajax call

} // End function ajaxCall
// --------------------------------------------------------------

// ==================== pageSelector() ==========================
function pageSelector(valoreRicerca) {
  // Seleziono tag select
  var select = $('.page-selector');

  select.val(1)

  // Cambio valore dell'opzione del tag select
  select.change(function() {
    // Seleziono opzione del select
    selectOption = $(select).val();

    // Stampo la pagina della ricerca
    // selezionata nel select (.page-selector)
    $.ajax(
      {
        url:"https://api.themoviedb.org/3/search/multi",
        method:"GET",
        data: {
          api_key:"345a41c08ec6d0c01364a6a7cd7a8052",
          query: valoreRicerca,
          page: selectOption,
          language: 'it-IT'
        },
        success: function(data) {
          var searchResults = data.results;

          resetSearchResult();

          movieTamplate(searchResults);

          filmHover();
        },
        error: function() {
          alert('ERRORE')
        }
      }
    ); // End ajax call

  });
}
// --------------------------------------------------------------

// ==================== movieTamplate() =========================
// Function movieTamplate
// Con hendlebars compilo il tamplate
// --->>> Argomento: un array di oggetti che ottengo con la chiamata ajax
function movieTamplate(resultArray) {

  for (var i = 0; i < resultArray.length; i++) {
    // Metto nella variabile singolo oggetto dell'array
    var sinngleMovie = resultArray[i];

    // Trasformazione da punteggio 10 a punteggio 5
    var rating = sinngleMovie.vote_average
    var ratingToPrint = movieScore(rating);

    // POSTER
    if (sinngleMovie.poster_path !== null) {
      var poster = 'https://image.tmdb.org/t/p/w500' + sinngleMovie.poster_path;
    } else {
      poster = 'img/no-poster1.jpg'
    }

    // GENERE
    var genere = 'Film'
    var titolo = sinngleMovie.title;
    var titoloOriginale = sinngleMovie.original_title;
    var uscita = sinngleMovie.release_date
    // Cambio le varioabili per i risultati SerieTV
    if (sinngleMovie.media_type === 'tv') {
      genere = 'Serie TV';
      titolo = sinngleMovie.name;
      titoloOriginale = sinngleMovie.original_name;
      uscita = sinngleMovie.first_air_date
    }


    if (sinngleMovie.media_type != "person") {
      // Compilo il template
      var source = $('#movies-template').html();
      var template = Handlebars.compile(source);

      // Metto nell'oggetto le chiavi del risultato e stampo i relativi valori
      var context = {
        // COMMON
        "poster" : poster,
        "genere": genere,
        "titolo" : titolo,
        "titolo-originale": titoloOriginale,
        "uscita": uscita,
        "overview": sinngleMovie.overview,
        "lingua": sinngleMovie.original_language,
        "voto_medio": ratingToPrint,
      }

      var html = template(context);

      // Appendo il template compilato nel container apposito
      $('.show-results .container').append(html)
    }

  }
}
// --------------------------------------------------------------

// ==================== resetPage() =============================
// Funzione resetPage()
// Azzero i risultati della pagina qualora fossero presenti
function resetSearchResult() {
  $('.show-results .container').html('');
}
// --------------------------------------------------------------

// ==================== printMessage() ==========================
// Funzione messagio di ERRORE
// argomento deve essere una stringa
function printMessage(text) {
  // Compilo il template
  var source = $('#message-template').html();
  var template = Handlebars.compile(source);

  var context = { message: text }
  var html = template(context);

  // Appendo il template compilato nel container apposito
  $('.show-results .container').append(html)
}
// --------------------------------------------------------------

// ==================== movieScore() ============================
// Funzione trasformazione voto
function movieScore(rating) {
  // Trasformazione punteggio a 5 punti
  var ratingTrasformato = rating / 2;

  var vote = Math.round(ratingTrasformato);

  var stars = '';
  for (var i = 1; i <= 5; i++) {
      if (i <= vote) {
        stars += '<i class="fas fa-star"></i>';
      } else {
        stars += '<i class="far fa-star"></i>';
      }
  }
  return stars;
}
// --------------------------------------------------------------

// Al maousehover nascondo il poster e mostro informazioni sul film
function filmHover() {
  $('.movie-container').each(function() {
    var singoloFilm = $(this);

    singoloFilm.mouseenter( function() {
      console.log('mouseenter');
      singoloFilm.find('.data-content').addClass('active');
      singoloFilm.find('.front-side').addClass('active');
    });

    singoloFilm.mouseleave( function() {
      console.log('mouseleave');
      singoloFilm.find('.data-content').removeClass('active');
      singoloFilm.find('.front-side').removeClass('active');
    });

  });
}

}) // end document ready
