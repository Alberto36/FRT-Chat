/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// Initializes FriendlyChat.
function FriendlyChat() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.messageList       = document.getElementById('messages');
  this.messageForm       = document.getElementById('message-form');
  this.messageInput      = document.getElementById('message');
  this.submitButton      = document.getElementById('submit');
  this.submitImageButton = document.getElementById('submitImage');
  this.imageForm         = document.getElementById('image-form');
  this.mediaCapture      = document.getElementById('mediaCapture');
  this.userPic           = document.getElementById('user-pic');
  this.userName          = document.getElementById('user-name');
  this.signInButton      = document.getElementById('sign-in');
  this.signOutButton     = document.getElementById('sign-out');
  this.signInSnackbar    = document.getElementById('must-signin-snackbar');
  this.submitOCRButton   = document.getElementById('submitOCR');   //OCR boton
  this.searchForm        = document.getElementById('search-form');
  this.myInput           = document.getElementById('myInput');

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Events for image upload.
  this.submitImageButton.addEventListener('click', function(e) {
    e.preventDefault();
    this.mediaCapture.click();
  }.bind(this));
  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

  //Busqueda de los mensajes
  this.myInput.addEventListener('click', function(){

      //EMPIEZA PROMESA------------------------------------------------
    var promesa = new Promise(function(resolve, reject){

          var Ref = firebase.database().ref('messages');

          //palabra a buscar en el input
          var input = document.getElementById('myInput').value;

          var textList = [];

          //Obtiene los mensajes que concuerdan en la Base de datos
          Ref.orderByChild("text").startAt(input).endAt(input+'\uf8ff').on("child_added", function(snapshot) {
            
            //Trae el valor del campo text en el nodo  
            var texto  = snapshot.child('text').val();
            var nombre = snapshot.child('name').val();
            //console.log(typeof(texto));
            textList.push( texto );
            textList.push( nombre );

          });

          // OBTENCION DE LA IMAGEN
          Ref.orderByChild('imageUrl').startAt(input).endAt(input+'\uf8ff').on("child_added", function(snapshot) {
            
            //Obtiene el link de la referencia en la BD de firebase
            var linkImagen = snapshot.child('imageUrl').val();
            var nombreUser = snapshot.child('name').val();

            //Obtiene el link dentro del storage de firebase de la imagen
            firebase.storage().refFromURL(linkImagen).getMetadata().then(function(metadata) {
              var imgLink     = metadata.downloadURLs[0];
              var nameFile    = metadata.name;
              var timeCreated = metadata.timeCreated;
              textList.push( nameFile );
              textList.push( imgLink );
            });
          });
          // FIN OBTENCION DE LA IMAGEN
          resolve( textList );


    }).then(function(messagesList){
        console.log(messagesList);
        autocomplete(document.getElementById("myInput"), messagesList);
    });//TERMINA PROMESA
  }); //termino del evento de buscar mensajes

  this.initFirebase();
}

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ BUSCADOR 
function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i+=2) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {


          if ( arr[i].indexOf( '.jpg' ) !== -1 || arr[i].indexOf( '.jpeg' ) !== -1 ||
               arr[i].indexOf( '.png' ) !== -1 || arr[i].indexOf( '.gif' ) !== -1){
          
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            b.setAttribute('class', 'message-searched visible');

            var c = document.createElement("DIV");
            c.setAttribute('class', 'mensaje');
            var d = document.createElement("DIV");
            d.setAttribute('class', 'nombre');
            var e = document.createElement("DIV");
            e.setAttribute('class', 'spacing');
            var f = document.createElement('div');
            f.setAttribute('class', "pic");

            var aTag = document.createElement('a');
            aTag.setAttribute('download', arr[i]);
            aTag.setAttribute( 'href', arr[i+1] );
            aTag.setAttribute( 'target', '_blank' );
          
            var imagen = document.createElement('img');
            imagen.setAttribute( 'src', arr[i+1] );
            imagen.setAttribute( 'width', '220px' );
            imagen.setAttribute( 'height', '200px' );
            aTag.appendChild(imagen);

            e.appendChild(f);
            b.appendChild(e);
            b.appendChild(aTag);
            b.appendChild(d);
          
            d.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            d.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            // d.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            d.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                alert( inp.value );
                closeAllLists();
            });
            a.appendChild(b);
            
          }else if ( arr[i].indexOf( '.pdf' ) !== -1 || arr[i].indexOf( '.PDF' ) !== -1){
          
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            b.setAttribute('class', 'message-searched visible');

            var c = document.createElement("DIV");
            c.setAttribute('class', 'mensaje');
            var d = document.createElement("DIV");
            d.setAttribute('class', 'nombre');
            var e = document.createElement("DIV");
            e.setAttribute('class', 'spacing');
            var f = document.createElement('div');
            f.setAttribute('class', "pic");

            var aTag = document.createElement('a');
            aTag.setAttribute( 'target', '_blank' );
            aTag.setAttribute('download', arr[i]);
            aTag.setAttribute( 'href', arr[i+1] );
          
            var pdf = document.createElement('img');
            pdf.setAttribute( 'src', 'images/pdf.png' );
            aTag.appendChild(pdf);

            e.appendChild(f);
            b.appendChild(e);
            b.appendChild(aTag);
            b.appendChild(d);
          
            d.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            d.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            d.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            a.appendChild(b);
          }else if ( arr[i].indexOf( '.docx' ) !== -1 || arr[i].indexOf( '.doc' ) !== -1 ||
                     arr[i].indexOf( '.DOCS' ) !== -1 || arr[i].indexOf( '.DOC' ) !== -1){
          
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            b.setAttribute('class', 'message-searched visible');

            var c = document.createElement("DIV");
            c.setAttribute('class', 'mensaje');
            var d = document.createElement("DIV");
            d.setAttribute('class', 'nombre');
            var e = document.createElement("DIV");
            e.setAttribute('class', 'spacing');
            var f = document.createElement('div');
            f.setAttribute('class', "pic");

            var aTag = document.createElement('a');
            aTag.setAttribute( 'target', '_blank' );
            aTag.setAttribute('download', arr[i]);
            aTag.setAttribute( 'href', arr[i+1] );
          
            var word = document.createElement('img');
            word.setAttribute( 'src', 'images/word.png' );
            aTag.appendChild(word);

            e.appendChild(f);
            b.appendChild(e);
            b.appendChild(aTag);
            b.appendChild(d);
          
            d.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            d.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            d.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            a.appendChild(b);

          }else if ( arr[i].indexOf( '.ppt' ) !== -1 || arr[i].indexOf( '.PPT' ) !== -1 ){
          
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            b.setAttribute('class', 'message-searched visible');

            var c = document.createElement("DIV");
            c.setAttribute('class', 'mensaje');
            var d = document.createElement("DIV");
            d.setAttribute('class', 'nombre');
            var e = document.createElement("DIV");
            e.setAttribute('class', 'spacing');
            var f = document.createElement('div');
            f.setAttribute('class', "pic");

            var aTag = document.createElement('a');
            aTag.setAttribute('download', arr[i]);
            aTag.setAttribute( 'href', arr[i+1] );
          
            var ppt = document.createElement('img');
            ppt.setAttribute( 'src', 'images/ppt.png' );
            aTag.appendChild(ppt);

            e.appendChild(f);
            b.appendChild(e);
            b.appendChild(aTag);
            b.appendChild(d);
          
            d.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            d.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            d.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            a.appendChild(b);

          }else if ( arr[i].indexOf( '.xls' ) !== -1 || arr[i].indexOf( '.XLS' ) !== -1 ||
                     arr[i].indexOf( '.xlsx' ) !== -1 || arr[i].indexOf( '.XLSX' ) !== -1){
          
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            b.setAttribute('class', 'message-searched visible');

            var c = document.createElement("DIV");
            c.setAttribute('class', 'mensaje');
            var d = document.createElement("DIV");
            d.setAttribute('class', 'nombre');
            var e = document.createElement("DIV");
            e.setAttribute('class', 'spacing');
            var f = document.createElement('div');
            f.setAttribute('class', "pic");

            var aTag = document.createElement('a');
            aTag.setAttribute('download', arr[i]);
            aTag.setAttribute( 'href', arr[i+1] );
          
            var excel = document.createElement('img');
            excel.setAttribute( 'src', 'images/excel.png' );
            aTag.appendChild(excel);

            e.appendChild(f);
            b.appendChild(e);
            b.appendChild(aTag);
            b.appendChild(d);
          
            d.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            d.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            d.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            a.appendChild(b);

          }else if ( arr[i].indexOf( '.js' ) !== -1 || arr[i].indexOf( '.txt' ) !== -1 ||
                     arr[i].indexOf( '.xml' ) !== -1 || arr[i].indexOf( '.json' ) !== -1 ||
                     arr[i].indexOf( '.JS' ) !== -1 || arr[i].indexOf( '.TXT' ) !== -1 ||
                     arr[i].indexOf( '.XML' ) !== -1 || arr[i].indexOf( '.JSON' ) !== -1){
          
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            b.setAttribute('class', 'message-searched visible');

            var c = document.createElement("DIV");
            c.setAttribute('class', 'mensaje');
            var d = document.createElement("DIV");
            d.setAttribute('class', 'nombre');
            var e = document.createElement("DIV");
            e.setAttribute('class', 'spacing');
            var f = document.createElement('div');
            f.setAttribute('class', "pic");

            var aTag = document.createElement('a');
            aTag.setAttribute('download', arr[i]);
            aTag.setAttribute( 'href', arr[i+1] );
          
            var file = document.createElement('img');
            file.setAttribute( 'src', 'images/file.png' );
            aTag.appendChild(file);

            e.appendChild(f);
            b.appendChild(e);
            b.appendChild(aTag);
            b.appendChild(d);
          
            d.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            d.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            d.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            a.appendChild(b);

// .mp3, .wav, .ogg, .midi, 
            }else if ( arr[i].indexOf( '.mp3' )  !== -1 || arr[i].indexOf( '.wav' )  !== -1 ||
                       arr[i].indexOf( '.midi' ) !== -1 || arr[i].indexOf( '.ogg' ) !== -1 ){
          
             /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            b.setAttribute('class', 'message-searched visible');

            var c = document.createElement("DIV");
            c.setAttribute('class', 'mensaje');
            var d = document.createElement("DIV");
            d.setAttribute('class', 'nombre');
            var e = document.createElement("DIV");
            e.setAttribute('class', 'spacing');
            var f = document.createElement('div');
            f.setAttribute('class', "pic");

            var audio = document.createElement('video');
            audio.setAttribute( 'src', arr[i+1] );
            audio.setAttribute('height', '50px');
            audio.setAttribute('width', '200px');
            audio.setAttribute( 'controls', 'true' );

            e.appendChild(f);
            b.appendChild(e);
            b.appendChild(audio);
            b.appendChild(d);
          
            d.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            d.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            d.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            a.appendChild(b);

          }else if ( arr[i].indexOf( '.mp4' )  !== -1 || arr[i].indexOf( '.avi' )  !== -1 ||
                       arr[i].indexOf( '.mpeg' ) !== -1 || arr[i].indexOf( '.mov' ) !== -1 ||
                       arr[i].indexOf( '.wmv' )  !== -1 || arr[i].indexOf( '.flv' )  !== -1){
          
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            b.setAttribute('class', 'message-searched visible');

            var c = document.createElement("DIV");
            c.setAttribute('class', 'mensaje');
            var d = document.createElement("DIV");
            d.setAttribute('class', 'nombre');
            var e = document.createElement("DIV");
            e.setAttribute('class', 'spacing');
            var f = document.createElement('div');
            f.setAttribute('class', "pic");

            var video = document.createElement('video');
            video.setAttribute( 'src', arr[i+1] );
            video.setAttribute('height', '120px');
            video.setAttribute('width', '200px');
            video.setAttribute( 'controls', 'true' );

            e.appendChild(f);
            b.appendChild(e);
            b.appendChild(video);
            b.appendChild(d);
          
            d.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            d.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            d.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            a.appendChild(b);

          }else{

             /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            b.setAttribute('class', 'message-searched visible');

            var c = document.createElement("DIV");
            c.setAttribute('class', 'mensaje');
            var d = document.createElement("DIV");
            d.setAttribute('class', 'nombre');
            var e = document.createElement("DIV");
            e.setAttribute('class', 'spacing');
            var f = document.createElement('div');
            f.setAttribute('class', "pic");
    
            e.appendChild(f);
            b.appendChild(e);
            b.appendChild(c);
            b.appendChild(d);
          
            c.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            d.innerHTML = arr[i+1];
            c.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            c.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            c.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
            //a.appendChild(divImagen); 

            
          }
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// Sets up shortcuts to Firebase features and initiate firebase auth.
FriendlyChat.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth     = firebase.auth();
  this.database = firebase.database();
  this.storage  = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('messages');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl, val.filename);
  }.bind(this);
  this.messagesRef.limitToLast(10).on('child_added', setMessage);
  this.messagesRef.limitToLast(10).on('child_changed', setMessage);
};

// Saves a new message on the Firebase DB.
FriendlyChat.prototype.saveMessage = function(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    // Add a new message entry to the Firebase Database.
    this.messagesRef.push({
      name: currentUser.displayName,
      // name: 'Anónimo',
      text: this.messageInput.value,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function() {
      // Clear message text field and SEND button state.
      FriendlyChat.resetMaterialTextfield(this.messageInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

// Sets the URL of the given img element with the URL of the image stored in Firebase Storage.
FriendlyChat.prototype.setImageUrl = function(imageUri, imgElement) {
  // If the image is a Firebase Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      var node = imgElement.lastChild;
      node.src = metadata.downloadURLs[0];
      imgElement.src  = metadata.downloadURLs[0];
      imgElement.href = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Sets the URL of the given img element with the URL of the image stored in Firebase Storage.
FriendlyChat.prototype.setPDFUrl = function(pdfUri, pdfElement) {
  // If the image is a Firebase Storage URI we fetch the URL.
  if (pdfUri.startsWith('gs://')) {
    pdfElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(pdfUri).getMetadata().then(function(metadata) {
      pdfElement.target   = '_blank';
      pdfElement.download = 'download'
      pdfElement.href     = metadata.downloadURLs[0];
    });
  } else {
    pdfElement.src = pdfUri;
  }
};

// Sets the URL of the given img element with the URL of the word file stored in Firebase Storage.
FriendlyChat.prototype.setWORDUrl = function(wordUri, wordElement) {
  // If the image is a Firebase Storage URI we fetch the URL.
  if (wordUri.startsWith('gs://')) {
    wordElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(wordUri).getMetadata().then(function(metadata) {
      wordElement.target   = '_blank';
      wordElement.download = 'download';
      wordElement.href     = metadata.downloadURLs[0];
    });
  } else {
    wordElement.src = wordUri;
  }
};

// Sets the URL of the given img element with the URL of the Power Point file stored in Firebase Storage.
FriendlyChat.prototype.setPowerPointUrl = function(pptUri, pptElement) {
  // If the image is a Firebase Storage URI we fetch the URL.
  if (pptUri.startsWith('gs://')) {
    pptElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(pptUri).getMetadata().then(function(metadata) {
      pptElement.src      = '/images/ppt.png'; //metadata.downloadURLs[0];
      pptElement.download = 'download'
      pptElement.href     = metadata.downloadURLs[0];
    });
  } else {
    pptElement.src = pptUri;
  }
};

// Sets the URL of the given img element with the URL of the Excel file stored in Firebase Storage.
FriendlyChat.prototype.setExcelUrl = function(excelUri, excelElement) {
  // If the image is a Firebase Storage URI we fetch the URL.
  if (excelUri.startsWith('gs://')) {
    excelElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(excelUri).getMetadata().then(function(metadata) {
      excelElement.download = 'download'
      excelElement.href     = metadata.downloadURLs[0];
    });
  } else {
    excelElement.src = excelUri;
  }
};

// Sets the URL of the given img element with the URL of the other file stored in Firebase Storage.
FriendlyChat.prototype.setFileUrl = function(fileUri, fileElement) {
  // If the image is a Firebase Storage URI we fetch the URL.
  if (fileUri.startsWith('gs://')) {
    fileElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(fileUri).getMetadata().then(function(metadata) {
      fileElement.src      = '/images/file.png'; //metadata.downloadURLs[0];
      fileElement.download = 'download'
      fileElement.href     = metadata.downloadURLs[0];
    });
  } else {
    fileElement.src = fileUri;
  }
};

// Sets the URL of the given img element with the URL of the image stored in Firebase Storage.
FriendlyChat.prototype.setVideoUrl = function(videoUri, vidElement) {
  // If the image is a Firebase Storage URI we fetch the URL.
  if (videoUri.startsWith('gs://')) {
    vidElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(videoUri).getMetadata().then(function(metadata) {
      vidElement.src = metadata.downloadURLs[0];
      vidElement.controls = 'controls';
    });
  } else {
    vidElement.src = videoUri;
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();
  //si el archivo sobrepasa el limite de tamanio {
  if( file.size <= 2097152 ) {

    // Check if the file is an image.
    if ( !file.type.match('image.*|video.*|audio.*|application.*') ) {
      var data = {
        message: 'You can only share images, videos, audio and some types of files',
        timeout: 3000
      };
      this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
      return;
    }

    // Check if the user is signed-in
    if (this.checkSignedInWithMessage()) {

      // We add a message with a loading icon that will get updated with the shared image.
      var currentUser = this.auth.currentUser;
      this.messagesRef.push({
        name: currentUser.displayName,
        // name: 'Anónimo',
        imageUrl: FriendlyChat.LOADING_IMAGE_URL,
        photoUrl: currentUser.photoURL || '/images/profile_placeholder.png',
        filename: file.name
      }).then(function(data) {

        // Upload the image to Firebase Storage.
        var filePath = currentUser.uid + '/' + data.key + '/' + file.name;
        return this.storage.ref(filePath).put(file).then(function(snapshot) {

          // Get the file's Storage URI and update the chat message placeholder.
          var fullPath = snapshot.metadata.fullPath;
          return data.update({imageUrl: this.storage.ref(fullPath).toString()});
        }.bind(this));
      }.bind(this)).catch(function(error) {
        console.error('There was an error uploading a file to Firebase Storage:', error);
      });
    }
  }else{
    var alerta = {
      message: 'You can only share files less than 2 Megabytes ',
      timeout: 3000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(alerta);
  }//termina tamanio de archivo
};

// Signs-in Friendly Chat.
FriendlyChat.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
FriendlyChat.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
FriendlyChat.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;
    // var userName = 'Anónimo';

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.
    this.loadMessages();

    // We save the Firebase Messaging Device token and enable notifications.
    this.saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Saves the messaging device token to the datastore.
FriendlyChat.prototype.saveMessagingDeviceToken = function() {
  firebase.messaging().getToken().then(function(currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.database().ref('/fcmTokens').child(currentToken)
          .set(firebase.auth().currentUser.uid);
    } else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  }.bind(this)).catch(function(error){
    console.error('Unable to get messaging token.', error);
  });
};

// Requests permissions to show notifications.
FriendlyChat.prototype.requestNotificationsPermissions = function() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    this.saveMessagingDeviceToken();
  }.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
FriendlyChat.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="filename"></div>' +
      '<div class="name"></div>' +
    '</div>';

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, name, text, picUrl, imageUri, filename) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.filename').textContent = filename;
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUri) { // If the message is an image.

    var arregloDeSubCadenas = imageUri.split('.',4);
    var extension = arregloDeSubCadenas[3];

    if( extension === 'png'  || extension === 'jpg' ||
        extension === 'PNG'  || extension === 'JPG' ||
        extension === 'gif'  || extension === 'GIF' ||
        extension === 'jpeg' || extension === 'JPEG'){

      var aImage = document.createElement('a');
      var image  = document.createElement('img');
      aImage.setAttribute( 'target', '_blank' );
      aImage.appendChild( image );

      aImage.addEventListener('load', function() {
        this.messageList.scrollTop = this.messageList.scrollHeight;
      }.bind(this));
      this.setImageUrl(imageUri, aImage);
      messageElement.innerHTML = '';
      messageElement.appendChild(aImage);
    } else if( extension === 'pdf' || extension === 'PDF' ){

      var pdf    = document.createElement('a');
      var imgRef = document.createElement('img');
      imgRef.src = '/images/pdf.png';
      pdf.appendChild(imgRef);

      pdf.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
      }.bind(this));
      this.setPDFUrl(imageUri, pdf);
      messageElement.innerHTML = '';
      messageElement.appendChild( pdf );
    }else if( extension === 'docx' || extension === 'DOCX' ||
               extension === 'doc' || extension === 'DOC' ){
      //console.log('Es un WORD');

      var word    = document.createElement('a');
      var wordRef = document.createElement('img');
      wordRef.src = '/images/word.png';
      word.appendChild(wordRef);

      word.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
      }.bind(this));
      this.setWORDUrl(imageUri, word);
      messageElement.innerHTML = '';
      messageElement.appendChild( word );


    }else if( extension === 'ppt' || extension === 'PPT'){
      //console.log('Es un PowerPoint');

      var ppt    = document.createElement('a');
      var pptRef = document.createElement('img');
      pptRef.src = '/images/ppt.png';
      ppt.appendChild(pptRef);

      ppt.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
      }.bind(this));
      this.setPowerPointUrl(imageUri, ppt);
      messageElement.innerHTML = '';
      messageElement.appendChild( ppt );

    } else if( extension === 'xls' || extension === 'XLS' ||
               extension === 'xlsx' || extension === 'XLSX' ){
      //console.log('Es un EXCEL');

      var excel    = document.createElement('a');
      var excelRef = document.createElement('img');
      excelRef.src = '/images/excel.png';
      excel.appendChild(excelRef);

      excel.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
      }.bind(this));
      this.setExcelUrl(imageUri, excel);
      messageElement.innerHTML = '';
      messageElement.appendChild( excel );

    } else if( extension === 'js' || extension === 'txt' || extension === 'json' ||
              extension === 'JS' || extension === 'TXT' || extension === 'JSON'){
      //console.log('Es un archivo diferente');

      var file    = document.createElement('a');
      var fileRef = document.createElement('img');
      fileRef.src = '/images/file.png';
      file.appendChild(fileRef);

      file.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
      }.bind(this));
      this.setFileUrl(imageUri, file);
      messageElement.innerHTML = '';
      messageElement.appendChild( file );

    }else if( extension === 'mp3'  || extension === 'MP3' ||
              extension === 'wav'  || extension === 'WAV' ||
              extension === 'ogg'  || extension === 'OGG' ||
              extension === 'midi' || extension === 'MIDI'){
      //console.log('Es audio');

      var audio = document.createElement('audio');
      audio.addEventListener('load', function() {
        this.messageList.scrollTop = this.messageList.scrollHeight;
      }.bind(this));
      this.setVideoUrl(imageUri, audio);
      messageElement.innerHTML = '';
      messageElement.appendChild(audio);

    }else if ( extension === 'mp4'  || extension === 'MP4'  || 
               extension === 'avi'  || extension === 'AVI'  ||
               extension === 'mpeg' || extension === 'MPEG' ||
               extension === 'mov'  || extension === 'MOV'  ||
               extension === 'wmv'  || extension === 'WMV'  ||
               extension === 'avi'  || extension === 'AVI'  ||
               extension === 'flv'  || extension === 'FLV'){
      //console.log('Es un video');

      var video = document.createElement('video');
      video.addEventListener('load', function() {
        this.messageList.scrollTop = this.messageList.scrollHeight;
      }.bind(this));
      this.setVideoUrl(imageUri, video);
      messageElement.innerHTML = '';
      messageElement.appendChild(video);
    } //termina if archivo
  }//termina if word
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};

// Enables or disables the submit button depending on the values of the input
// fields.
FriendlyChat.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

window.onload = function() {
  window.friendlyChat = new FriendlyChat();
};
