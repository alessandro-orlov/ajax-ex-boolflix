$(document).ready(function() {

  // ==============================================================
  // ====================== CLIK ON BUTTON ========================
  $('button.search-movie-btn').click(function() {
    resetSearchResult();

    var inputValue = getInputValue();

    ajaxCall(inputValue,'movie');
    ajaxCall(inputValue,'tv');

  }); // End click

  // ==============================================================
  // ====================== KEYPRESS EVENT ========================
  $('.search-movie').keypress(function(event) {
    if (event.which === 13 ) {
      resetSearchResult();

      var inputValue = getInputValue();

      ajaxCall(inputValue,'movie');
      ajaxCall(inputValue,'tv');
    }
  }); // End keypress event


// ==============================================================
// ======================== FUNZIONI ============================
// ==============================================================

// ==================== getInputValue() =========================
// Funzione getInputValue()
// legge il valore dell'input .search-movie
// ---> return: valore dell'input
function getInputValue() {
    // Leggo il valore all'evento (click, keypress)
    var searchInputValue = $('input.search-movie').val();

    // Resetto il valore dell'input dopo l'evento (click, keypress)
    $('input.search-movie').val('');

    // Ritorno il valore dell'input
    return searchInputValue
};
// --------------------------------------------------------------

// ===================== ajaxCall() =============================
// Funzione ajaxCall
// api_key: 345a41c08ec6d0c01364a6a7cd7a8052
// Chiama il database di Themoviedatabase.org
// Argomenti:
// ---> valoreRicerca = una stringa/testo
// ---> searchType = determina endpoint dell'api può essere di 2 tipi 'tv' oppure 'movie'.
// return: ninete
function ajaxCall(valoreRicerca, searchType) {
  if(searchType === 'movie') {
    var url = "https://api.themoviedb.org/3/search/movie"
  } else if (searchType === 'tv') {
    url = "https://api.themoviedb.org/3/search/tv"
  }
  $.ajax(
    {
      url: url,
      method:"GET",
      data: {
        api_key:"345a41c08ec6d0c01364a6a7cd7a8052",
        query: valoreRicerca,
        page: 1,
        language: 'it-IT',
        // include_adult: true
      },
      success: function(data) {
        var totalResults = data.total_results
        var searchResults = data.results;

        if(searchResults.length > 0) {

          if(searchType === 'movie') {
            $('.movies .results-number').text(data.total_results)
          } else {
            $('.tv-series .results-number').text(data.total_results)
          }

          $('.show-results p.risultati').removeClass('hidden');

          movieTamplate(searchResults, searchType);

          filmHover();

        } else {

          noResultsMessage(searchType, data);

        }
      },
      error: function() {
        resetSearchResult();

        var errore = "<i class='fas fa-exclamation-triangle'></i>" + "<p class='first-msg'>" + "Qualcosa non torna" + "</p>" + "<p class='second-msg'>" + 'Devi inserire almeno una parola' + "</p>";

        printMessage(errore);
      }
    }
  ); // End ajax call

} // End function ajaxCall
// --------------------------------------------------------------

// ==================== objectTamplate() =========================
// Function movieTamplate
// Con hendlebars compilo il tamplate:
// Argomenti:
// ---> resultArray = un array di oggetti che ottengo con la chiamata ajax
// ---> searchType = determina l'endpoint della chiamata API (si ottiene leggendo l'argomento della funzione "ajaxCall()"
function movieTamplate(resultArray, searchType) {

  for (var i = 0; i < resultArray.length; i++) {
    // Metto nella variabile singolo oggetto dell'array
    var singleObject = resultArray[i];
    // console.log(singleObject)

    // Trasformazione da punteggio 10 a punteggio 5
    var rating = singleObject.vote_average
    var ratingToPrint = movieScore(rating);

    // Trasformazione data di uscita nel formato leggibile
    moment.locale('it');
    var dataUscitaMovie = moment(singleObject.release_date).format('D MMM YYYY');
    var dataUscitaTV = moment(singleObject.first_air_date).format('D MMM YYYY');


    // POSTER
    if (singleObject.poster_path !== null) {
      var poster = 'https://image.tmdb.org/t/p/original' + singleObject.poster_path;
    } else {
      poster = 'img/no-poster1.jpg'
    }

    // GENERE
    if (searchType === 'movie') {
      var genere = 'Film'
      var titolo = singleObject.title;
      var titoloOriginale = singleObject.original_title;
      var uscita = dataUscitaMovie;
    } else {
      // Cambio le varioabili per i risultati SerieTV
      genere = 'Serie TV';
      titolo = singleObject.name;
      titoloOriginale = singleObject.original_name;
      uscita = dataUscitaTV;
    }

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
      "overview": singleObject.overview,
      "lingua": singleObject.original_language,
      "voto_medio": ratingToPrint,
    }

    var html = template(context);

    // Appendo il template compilato nel container apposito
    if (searchType === 'movie') {
      $('.show-results .container.movies-results').append(html);
    } else {
      $('.show-results .container.tv-series-results').append(html);
    }
  }
}
// --------------------------------------------------------------

// ==================== resetPage() =============================
// Funzione resetPage()
// Azzero i risultati della pagina qualora fossero presenti
function resetSearchResult() {
  $('.show-results p.risultati').addClass('hidden');

  $('.movies .results-number').text('');
  $('.show-results .container.movies-results').html('');

  $('.tv-series .results-number').text('');
  $('.show-results .container.tv-series-results').html('');

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

// ==================== noResultsMessage() ============================
// stamo il messagio quando la ricerca non ha prodotto i risultati
function noResultsMessage(searchType, data) {
  $('.show-results p.risultati').removeClass('hidden');
  var noResultsMessage = '<span class="no-results-message">'+ "La ricerca non ha prodotto risultati" + '<span>';

  if(searchType === 'movie') {
    $('.movies .results-number').text(data.total_results);
    $('.show-results .container.movies-results').html(noResultsMessage);
  } else {
    $('.tv-series .results-number').text(data.total_results);
    $('.show-results .container.tv-series-results ').html(noResultsMessage);
  }

  return noResultsMessage;
}
// --------------------------------------------------------------

// Al maousehover nascondo il poster e mostro informazioni sul film
function filmHover() {
  $('.movie-container').each(function() {
    var singoloFilm = $(this);

    singoloFilm.mouseenter( function() {
      singoloFilm.find('.data-content').addClass('active');
      singoloFilm.find('.front-side').addClass('active');
    });

    singoloFilm.mouseleave( function() {
      singoloFilm.find('.data-content').removeClass('active');
      singoloFilm.find('.front-side').removeClass('active');
    });

  });
}
// --------------------------------------------------------------

}) // end document ready
