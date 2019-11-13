// Inicializa con botones deshabiilitados
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
  var aux = puntos[id];
  puntos[id] = puntos[id - 1];
  puntos[id - 1] = aux;

  var stopAux = routeParams.stops.features[id];
  routeParams.stops.features[id] = routeParams.stops.features[id - 1];
  routeParams.stops.features[id - 1] = stopAux;
  actualizarPuntos();
}

function bajarPunto(id) {
  var aux = puntos[id];
  puntos[id] = puntos[id + 1];
  puntos[id + 1] = aux;

  var stopAux = routeParams.stops.features[id];
  routeParams.stops.features[id] = routeParams.stops.features[id + 1];
  routeParams.stops.features[id + 1] = stopAux;
  actualizarPuntos();
}

function eliminarPto(id) {
  puntos.splice(id, 1);
  map.graphics.remove(routeParams.stops.features.splice(id, 1)[0]);
  actualizarPuntos();

  pointServiceLayer.clear();
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
