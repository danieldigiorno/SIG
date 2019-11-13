// Expandir y contraer menu
// $(document).on("click", ".panel-heading span.clickable", function(e) {
//   var $this = $(this);
//   if (!$this.hasClass("panel-collapsed")) {
//     $this
//       .parents(".panel")
//       .find(".panel-body")
//       .slideUp();
//     $this.addClass("panel-collapsed");
//     $this
//       .find("i")
//       .removeClass("glyphicon-minus")
//       .addClass("glyphicon-plus");
//   } else {
//     $this
//       .parents(".panel")
//       .find(".panel-body")
//       .slideDown();
//     $this.removeClass("panel-collapsed");
//     $this
//       .find("i")
//       .removeClass("glyphicon-plus")
//       .addClass("glyphicon-minus");
//   }
// });

// $(document).on("click", ".panel div.clickable", function(e) {
//   var $this = $(this);
//   if (!$this.hasClass("panel-collapsed")) {
//     $this
//       .parents(".panel")
//       .find(".panel-body")
//       .slideUp();
//     $this.addClass("panel-collapsed");
//     $this
//       .find("i")
//       .removeClass("glyphicon-minus")
//       .addClass("glyphicon-plus");
//   } else {
//     $this
//       .parents(".panel")
//       .find(".panel-body")
//       .slideDown();
//     $this.removeClass("panel-collapsed");
//     $this
//       .find("i")
//       .removeClass("glyphicon-plus")
//       .addClass("glyphicon-minus");
//   }
// });

// Inicializar botones
$(document).ready(function() {
  $("#rutaBtn").prop("disabled", true);
  $("#borrarRutaBtn").prop("disabled", true);
  $("#guardarRutaBtn").prop("disabled", true);
  $("#subirPtosBtn").prop("disabled", true);
  $("#borrarPtosBtn").prop("disabled", true);
  $("#start").prop("disabled", true);
  $("#stop").prop("disabled", true);
  $("#infoList").prop("hidden", true);
});

//Actualizo los puntos que muestro en la lista.
function actualizarPuntos() {
  $("#listaPtos").empty();
  var j = 0;
  while (j < puntos.length) {
    $(
      "<div class=" +
        "list-items" +
        " id=" +
        "elem_" +
        j +
        ">" +
        j +
        ") " +
        puntos[j].name +
        "</div>"
    ).appendTo("#listaPtos");
    $(
      "<button class=" +
        "'boton-unset'" +
        " id=" +
        "btn_" +
        j +
        " onclick=" +
        "eliminarPto(" +
        j +
        ') style="float:right; margin-right:5px; margin-left:10px"' +
        ">&#10060</button>"
    ).appendTo("#elem_" + j);
    if (j > 0) {
      $(
        "<button class=" +
          "'boton-unset'" +
          " id=" +
          "up_btn_" +
          j +
          " onclick=" +
          "subirPunto(" +
          j +
          ') style="float:right" ' +
          ">&#9650</button>"
      ).appendTo("#elem_" + j);
    }
    if (j < puntos.length - 1) {
      $(
        "<button class=" +
          "'boton-unset'" +
          " id=" +
          "down_btn_" +
          j +
          " onclick=" +
          "bajarPunto(" +
          j +
          ') style="float:right" ' +
          ">&#9660</button>"
      ).appendTo("#elem_" + j);
    }
    j++;
  }
}

function subirPunto(id) {
  //intercambiar puntos
  var aux = puntos[id];
  puntos[id] = puntos[id - 1];
  puntos[id - 1] = aux;
  //intercambiar stops
  var stopAux = routeParams.stops.features[id];
  routeParams.stops.features[id] = routeParams.stops.features[id - 1];
  routeParams.stops.features[id - 1] = stopAux;
  //actualizar lista puntos web
  actualizarPuntos();
}
function bajarPunto(id) {
  //intercambiar puntos
  var aux = puntos[id];
  puntos[id] = puntos[id + 1];
  puntos[id + 1] = aux;
  //intercambiar stops
  var stopAux = routeParams.stops.features[id];
  routeParams.stops.features[id] = routeParams.stops.features[id + 1];
  routeParams.stops.features[id + 1] = stopAux;
  //actualizar lista puntos web
  actualizarPuntos();
}
function eliminarPto(id) {
  // saca el punto del array de puntos
  puntos.splice(id, 1);

  // Saca el punto de los stops
  map.graphics.remove(routeParams.stops.features.splice(id, 1)[0]);
  actualizarPuntos();
  pointServiceLayer.clear();
  // Cartel de No hay puntos
  if (puntos.length == 0) {
    $("#listMsj").prop("hidden", false);
    $("#subirPtosBtn").prop("disabled", true);
    $("#borrarPtosBtn").prop("disabled", true);
  } else {
    $("#listMsj").prop("hidden", true);
  }
  if (puntos.length >= 2) {
    $("#rutaBtn").prop("disabled", false);
  } else {
    $("#rutaBtn").prop("disabled", true);
  }
}
