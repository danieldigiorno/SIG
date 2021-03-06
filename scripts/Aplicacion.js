var map,
  search,
  routeTask,
  routeParams,
  pointServiceLayer,
  rutas = [],
  puntos = [];

require([
  "esri/map",
  "esri/tasks/locator",
  "esri/dijit/Search",
  "esri/layers/ArcGISTiledMapServiceLayer",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/layers/GraphicsLayer",
  "esri/symbols/SimpleFillSymbol",
  "esri/layers/FeatureLayer",
  "esri/tasks/RouteTask",
  "esri/tasks/RouteParameters",
  "esri/tasks/FeatureSet",
  "esri/Color",
  "esri/tasks/geometry",
  "esri/geometry/geometryEngine",
  "esri/geometry/Point",
  "esri/graphic",
  "esri/tasks/QueryTask",
  "esri/tasks/query",
  "esri/dijit/Print",
  "dojo/_base/array",
  "dojo/dom",
  "dojo/on",
  "dojo/domReady!"
], function(
  Map,
  Locator,
  Search,
  ArcGISTiledMapServiceLayer,
  SimpleMarkerSymbol,
  SimpleLineSymbol,
  GraphicsLayer,
  SimpleFillSymbol,
  FeatureLayer,
  RouteTask,
  RouteParameters,
  FeatureSet,
  Color,
  Geometry,
  GeometryEngine,
  Point,
  Graphic,
  QueryTask,
  Query,
  Print,
  array,
  dom,
  on
) {
  var terminar = false;
  var iter,
    salto = 0;
  var estadoActual = "";
  var stateAnterior = "";
  var colorActual = 1;
  var rutaServicioLayer;

  /**********************************************Simbolos********************************************************************************* */
  // Para los puntos
  var simboloPunto = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE);
  simboloPunto.setColor(new Color([230, 0, 0, 1]));
  simboloPunto.setSize(12);

  // Para el móvil
  var simboloMovil = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE);
  simboloMovil.setPath(
    "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z"
  );
  simboloMovil.setOffset(0, 20);
  simboloMovil.setSize(26);

  // Para la ruta
  var simboloRuta = new SimpleLineSymbol()
    .setColor(new Color([0, 0, 255, 0.5]))
    .setWidth(4);

  //*******************************************MAPA    SEARCH ***************************************************************************** */
  map = new Map("map", {
    fadeOnZoom: true,
    center: [-90, 37],
    zoom: 4,
    minZoom: 4,
    smartNavigation: false
  });

  // Base del mapa
  var tiled = new ArcGISTiledMapServiceLayer(
    "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
  );
  map.addLayer(tiled);

  // Búsqueda del mapa
  search = new Search(
    {
      sources: [
        {
          locator: new Locator(
            "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
          ),
          placeholder: "Definir stops",
          countryCode: "US"
        }
      ],
      map: map
    },
    "search"
  );
  search.startup();
  search.on("search-results", searchHandler);

  /************************************************* Manejo puntos ********************************************************************************************* */

  var cantElementos = 0;
  function searchHandler(evt) {
    if (evt != null) {
      cantElementos = puntos.length;
      var pto = evt.results[0][0];
      var ptoNuevo = new Object();
      ptoNuevo.name = pto.name;
      ptoNuevo.geometry = pto.feature.geometry;
      ptoNuevo.symbol = simboloPunto;

      var existe = false;
      var i = 0;
      while (i < puntos.length && !existe) {
        if (ptoNuevo.name == puntos[i].name) {
          existe = true;
        }
        i++;
      }

      if (!existe) {
        puntos.push(ptoNuevo);

        // "disabled" = false solo en caso de que haya dos o más puntos
        if (puntos.length > 1) {
          $(dom.byId("rutaBtn")).prop("disabled", false);
        } else if (puntos.length <= 1) {
          $(dom.byId("rutaBtn")).prop("disabled", true);
        }
        if (puntos.length > 0) {
          $(dom.byId("listMsj")).prop("hidden", true);
        } else if (puntos.length == 0) {
          $(dom.byId("listMsj")).prop("hidden", false);
        }

        $(dom.byId("subirPtosBtn")).prop("disabled", false);
        $(dom.byId("borrarPtosBtn")).prop("disabled", false);

        // Agrega el stop y dibuja el punto en el mapa
        routeParams.stops.features.push(
          map.graphics.add(new Graphic(ptoNuevo.geometry, ptoNuevo.symbol))
        );
        actualizarPuntos();
      }
    }
  }

  // Para subir puntos al servidor
  var pointsFeatureLayer = FeatureLayer(
    "http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Events/FeatureServer/0",
    {
      mode: FeatureLayer.MODE_SNAPSHOT,
      outFields: ["*"]
    }
  );
  pointsFeatureLayer.setSelectionSymbol(simboloPunto);
  on(dom.byId("subirPtosBtn"), "click", subirPuntos);

  // Para subir al servidor los puntos ingresados por el usuario
  function subirPuntos() {
    puntos.forEach(function(ptoNuevo) {
      var attributes = {
        event_type: "13",
        description: ptoNuevo.name
      };
      var puntoSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE);
      puntoSymbol.setColor(new Color([255, 85, 0, 0.64]));
      puntoSymbol.setSize(15);
      var newGraphic = new Graphic(ptoNuevo.geometry, puntoSymbol, attributes);
      pointsFeatureLayer.applyEdits([newGraphic], null, null);
    });
    alert("Los puntos han sido guardados con éxito");
  }

  // Capa donde se ponen los puntos descargados del servicio
  pointServiceLayer = new GraphicsLayer({ opacity: 0.9 });

  // Boton para descargar puntos del servidor
  on(dom.byId("descargarPtosBtn"), "click", descargarPuntos);

  // Funcion para descargar puntos del servidor
  function descargarPuntos() {
    // Filtrar capa de puntos
    var query = new Query();
    query.where = "event_type = '13'";
    pointsFeatureLayer.selectFeatures(query);
    pointsFeatureLayer.on("selection-complete", cargoPuntosServicio);

    // Se dibujan los puntos obtenidos en la query del servicio
    function cargoPuntosServicio(response) {
      if (response.features.length == 0) {
        alert("Error: no hay puntos subidos para cargar");
      } else {
        var features = response.features;
        for (var i = 0; i < features.length; i++) {
          // Creo el punto subido
          var ptoNuevo = new Object();
          ptoNuevo.name = features[i].attributes.description;
          ptoNuevo.geometry = features[i].geometry;
          ptoNuevo.symbol = features[i].symbol;
          // Ver si existe
          var existe = false;
          var j = 0;
          while (j < puntos.length && !existe) {
            if (ptoNuevo.name == puntos[j].name) {
              existe = true;
            }
            j++;
          }
          // Si no existe lo guardo, lo agrego como stop y lo muestro en el mapa
          if (!existe) {
            puntos.push(ptoNuevo);
            routeParams.stops.features.push(
              //dibuja punto en el mapa
              map.graphics.add(new Graphic(ptoNuevo.geometry, ptoNuevo.symbol))
            );
            pointServiceLayer.add(
              new Graphic(ptoNuevo.geometry, ptoNuevo.symbol)
            );
          }
        }

        map.addLayer(pointServiceLayer);

        actualizarPuntos();

        // Oculta cartel de la lista
        if (puntos.length > 1) {
          $(dom.byId("rutaBtn")).prop("disabled", false);
        } else if (puntos.length <= 1) {
          $(dom.byId("rutaBtn")).prop("disabled", true);
        }
        if (puntos.length > 0) {
          $(dom.byId("listMsj")).prop("hidden", true);
        } else if (puntos.length == 0) {
          $(dom.byId("listMsj")).prop("hidden", false);
          $(dom.byId("rutaBtn")).prop("disabled", true);
        }

        $(dom.byId("subirPtosBtn")).prop("disabled", false);
        $(dom.byId("borrarPtosBtn")).prop("disabled", false);
      }
    }
  }
  // Botón borrar puntos
  on(dom.byId("borrarPtosBtn"), "click", borrarPuntos);

  // Funcion borra los puntos dibujados del mapa, como stop y de la lista
  function borrarPuntos() {
    for (var i = routeParams.stops.features.length - 1; i >= 0; i--) {
      map.graphics.remove(routeParams.stops.features.splice(i, 1)[0]);
    }
    puntos = [];
    $("#listaPtos").empty();
    $(dom.byId("subirPtosBtn")).prop("disabled", true);
    $(dom.byId("borrarPtosBtn")).prop("disabled", true);
    $(dom.byId("listMsj")).prop("hidden", false);
    $(dom.byId("rutaBtn")).prop("disabled", true);

    pointServiceLayer.clear();
  }

  /***************************************************************************Manejo Rutas*************************************************************************************** */
  //Creo el task de ruteo
  routeTask = new RouteTask(
    "https://utility.arcgis.com/usrsvcs/appservices/sAPOQxE99RKO83Fm/rest/services/World/Route/NAServer/Route_World/solve"
  );
  routeParams = new RouteParameters();
  routeParams.stops = new FeatureSet();
  routeParams.outSpatialReference = { wkid: 102100 };

  //  Capa de Ruta
  var routeGraphicLayer = new GraphicsLayer({ opacity: 0.9 });

  // Botón para calcular ruta
  on(dom.byId("rutaBtn"), "click", calcularRuta);

  //Funcion para calcular ruta
  function calcularRuta() {
    document.getElementById("rutaBtn").innerHTML = "Cargando...";
    routeTask.solve(routeParams);
  }

  //seteo el handler ruteo
  routeTask.on("solve-complete", dibujarRuta);

  // Handler para dibujar la ruta calculada
  function dibujarRuta(evt) {
    borrarRutas();
    array.forEach(evt.result.routeResults, function(routeResult, i) {
      rutas.push(map.graphics.add(routeResult.route.setSymbol(simboloRuta)));
      routeGraphicLayer.add(routeResult.route.setSymbol(simboloRuta));
      map.centerAndZoom([-95, 39], 4);
    });

    // Agrego la capa de la ruta al mapa
    map.addLayer(routeGraphicLayer);

    // Deshabilito botones
    $(dom.byId("start")).prop("disabled", false);
    $(dom.byId("borrarRutaBtn")).prop("disabled", false);
    $(dom.byId("guardarRutaBtn")).prop("disabled", false);
    document.getElementById("rutaBtn").innerHTML = "Trazar ruta";
  }

  // Botón para borrar rutas
  on(dom.byId("borrarRutaBtn"), "click", borrarRutas);

  //Funcion para borrar las rutas dibujadas del mapa y de la lista
  function borrarRutas() {
    for (var i = rutas.length - 1; i >= 0; i--) {
      map.graphics.remove(rutas.splice(i, 1)[0]);
    }
    rutas = [];
    routeGraphicLayer.clear();
    if (rutaServicioLayer !== undefined) {
      rutaServicioLayer.clear();
    }
    $("#borrarRutaBtn").prop("disabled", true);
    $("#start").prop("disabled", true);
  }

  // Capa para subir rutas al servidor
  var routesFeatureLayer = FeatureLayer(
    "http://sampleserver5.arcgisonline.com/arcgis/rest/services/LocalGovernment/Recreation/FeatureServer/1",
    {
      mode: FeatureLayer.MODE_SNAPSHOT,
      outFields: ["*"]
    }
  );

  //Boton guardar ruta
  on(dom.byId("guardarRutaBtn"), "click", guardarRuta);

  //Funcion guardar ruta en el servidor
  function guardarRuta() {
    var nombreRuta =
      "grupo2Rutas_" + $("#selectedRoute	 option:selected")[0].value;
    // Guardar la ruta seleccionada.
    var atributos = {
      trailtype: 4,
      notes: nombreRuta
    };
    var newGraphic = new Graphic(rutas[0].geometry, simboloRuta, atributos);

    // Subo la ruta en el servicio
    routesFeatureLayer.applyEdits([newGraphic], null, null);
    alert("Ruta guardada con exito");
  }
  // Cargar ruta seleccionada
  on(dom.byId("cargarRutaBtn"), "click", cargarRuta);
  function cargarRuta() {
    var rutaSeleccionada = $("#selectedRoute option:selected")[0].value;

    //Filtrar rutas del servidor
    var query = new Query();
    var note = "grupo2Rutas_" + rutaSeleccionada;
    query.where = "notes = '" + note + "'";
    query.outSpatialReference = { wkid: 102100 };
    routesFeatureLayer.selectFeatures(query);

    routesFeatureLayer.on("selection-complete", dibujarRutaGuardadaHandler);

    // Capa donde se ponen los puntos filtrados del servicio
    rutaServicioLayer = new GraphicsLayer({ opacity: 0.9 });

    //Handler para dibujar la ruta obtenida en la query del servicio
    function dibujarRutaGuardadaHandler(response) {
      if (response.features.length == 0) {
        alert("Error: no se encuentra ninguna ruta guardada previamente");
      } else {
        // Si había ruta cargada, se borra.
        borrarRutas();
        borrarPuntos();
        routeGraphicLayer.clear();
        movilLayer.clear();

        if (response != null && response.features.length > 0) {
          $(dom.byId("start")).prop("disabled", false);
          $(dom.byId("borrarRutaBtn")).prop("disabled", false);
        }
        // Se carga la nueva ruta.
        array.forEach(response.features, function(featureResult, i) {
          rutas.push(map.graphics.add(featureResult.setSymbol(simboloRuta)));
          rutaServicioLayer.add(featureResult.setSymbol(simboloRuta));
        });
        map.addLayer(rutaServicioLayer);
      }
    }
  }
  /***********************************************************Simulacion************************************************************************************************/
  //Servicio para consultas vectoriales
  var geometryService = new esri.tasks.GeometryService(
    "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
  );

  // Capa graphic del móvil
  var movilLayer = new GraphicsLayer();

  on(dom.byId("start"), "click", startSimulacion);

  function startSimulacion() {
    var cantPtosRta = 10;
    $("#start").prop("disabled", true);
    $("#borrarRutaBtn").prop("disabled", true);
    $("#stop").prop("disabled", false);
    $("#ptosList").prop("hidden", true);
    $("#infoList").prop("hidden", false);
    $(".panel div.clickable").click();

    iter = 0;
    // Comenzar timer.
    setTimeout(moverMovil, 100);
    terminar = false;
  }

  var radioBuffer;
  var nombreEstado;
  // Funcion para mover el movil
  var colorBuffer = new dojo.Color([0, 0, 255, 0.15]);
  function moverMovil() {
    // Para pedir condados y poblacion
    var queryTaskCounties = new QueryTask(
      "http://services.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_1990-2000_Population_Change/MapServer/3"
    );
    var queryTaskStates = new QueryTask(
      "http://services.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_1990-2000_Population_Change/MapServer/4"
    );

    if (!terminar) {
      // Si llegué al final o me pase de la cantidad de puntos entonces llegue al final
      if (iter >= rutas[0].geometry.paths[0].length - 1) {
        iter = rutas[0].geometry.paths[0].length - 1;
        terminar = true;
        //Actualizo botones
        $("#stop").prop("disabled", true);
        $("#start").prop("disabled", false);
        movilLayer.clear();
      }

      // Punto siguiente del móvil.
      xsig = rutas[0].geometry.paths[0][iter][0];
      ysig = rutas[0].geometry.paths[0][iter][1];
      var ptoSig = new Point(xsig, ysig, map.spatialReference);

      if ($("#myonoffswitch").is(":checked")) {
        if ($("#p")[0].checked) map.centerAndZoom(ptoSig, 10);
        else if ($("#m")[0].checked) map.centerAndZoom(ptoSig, 9);
        else if ($("#g")[0].checked) map.centerAndZoom(ptoSig, 8);
      }
      movilLayer.clear();
      // Se dibuja el movil en el mapa.
      movilLayer.add(new Graphic(ptoSig, simboloMovil));

      // Dividimos los puntos que forman la polilinea en 50 saltos
      salto = parseInt(rutas[0].geometry.paths[0].length / 50); 
      iter = iter + salto;

      // Dibuja buffer en la capa del móvil
      var params = new esri.tasks.BufferParameters();
      params.geometries = [ptoSig];

      // Tamaño del buffer
      if ($("#p")[0].checked) radioBuffer = 15;
      else if ($("#m")[0].checked) radioBuffer = 30;
      else if ($("#g")[0].checked) radioBuffer = 50;

      params.distances = [radioBuffer];
      params.unit = 9036;
      params.outSpatialReference = { wkid: 102100 };

      geometryService.buffer(params, mostrarBuffer);

      function mostrarBuffer(geometries) {
        var bufferMovil = geometries[0];

        // Query States movil
        var queryEstado = new Query();
        queryEstado.returnGeometry = true;
        queryEstado.outFields = ["ST_ABBREV", "NAME"];
        queryEstado.geometry = ptoSig;
        queryEstado.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;

        queryTaskStates.execute(queryEstado);
        queryTaskStates.on("error", function(err) {
          console.log("No se pudo obtener el state : " + err);
        });

        queryTaskStates.on("complete", function(evt) {
          stateAnterior = estadoActual;
          estadoActual = evt.featureSet.features[0].attributes.ST_ABBREV;
          var symbolEstado = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_NULL,
            new SimpleLineSymbol(
              SimpleFillSymbol.STYLE_SOLID,
              new Color([230, 0, 169, 1]),
              3
            )
          );
          var geometryEstado = evt.featureSet.features[0].geometry;
          var graphicEstado = new Graphic(geometryEstado, symbolEstado);

          // Cambio de color del buffer al cambiar de estado
          if (stateAnterior != estadoActual && stateAnterior != "") {
            if (colorActual == 1) {
              colorActual = 2;
              colorBuffer = new dojo.Color([255, 127, 127, 0.64]);
            } else {
              colorActual = 1;
              colorBuffer = new dojo.Color([0, 0, 255, 0.15]);
            }
          }

          var symbol = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(
              esri.symbol.SimpleLineSymbol.STYLE_SOLID,
              colorBuffer,
              2
            ),
            colorBuffer
          );

          dojo.forEach(geometries, function(geometry) {
            var graphic = new Graphic(geometry, symbol);
            movilLayer.add(graphic);
            movilLayer.add(new Graphic(ptoSig, simboloMovil));
            movilLayer.add(graphicEstado);
          });

          nombreEstado = evt.featureSet.features[0].attributes.NAME;
        });

        // Query Counties overlap buffer
        var queryCounties = new Query();
        queryCounties.returnGeometry = true;
        queryCounties.outFields = [
          "NAME",
          "TOTPOP_CY",
          "LANDAREA",
          "ST_ABBREV"
        ];
        queryCounties.geometry = bufferMovil;
        queryCounties.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
        queryCounties.outSpatialReference = { wkid: 102100 };

        var interseccion = queryTaskCounties.execute(queryCounties);

        queryTaskCounties.on("error", function(err) {
          alert(err);
        });

        queryTaskCounties.on("complete", function(evt) {
          var total_population = 0;
          var pop_inter_countie = 0;
          var counties = "";
          var fset = evt.featureSet;
          var symbolCondado = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_NULL,
            new SimpleLineSymbol(
              SimpleFillSymbol.STYLE_SOLID,
              new Color([10, 180, 10]),
              3
            )
          );

          var resultFeatures = fset.features;
          var popTotal = 0;
          for (var i = 0, il = resultFeatures.length; i < il; i++) {
            var graphic = resultFeatures[i];
            var name = graphic.attributes.NAME;

            // De millas a km
            var area_countie = Math.ceil(
              graphic.attributes.LANDAREA * 2,
              58998811
            );
            pop_countie = graphic.attributes.TOTPOP_CY;

            var inter = GeometryEngine.intersect(bufferMovil, graphic.geometry);
            var area_interseccion = Math.ceil(
              GeometryEngine.geodesicArea(inter, 109414)
            );

            total_population += Math.ceil(
              (area_interseccion * pop_countie) / area_countie
            );
            pop_inter_countie = Math.ceil(
              (area_interseccion * pop_countie) / area_countie
            );
            var num = i + 1;
            counties +=
              "&#8226; " +
              name +
              ": " +
              pop_inter_countie +
              "/" +
              pop_countie +
              "<br/>";

            graphic.setSymbol(symbolCondado);
            movilLayer.add(graphic);
            movilLayer.add(new Graphic(ptoSig, simboloMovil));
          }

          var tipoRadio;
          if ($("#p")[0].checked) tipoRadio = "Chico";
          else if ($("#m")[0].checked) tipoRadio = "Mediano";
          else if ($("#g")[0].checked) tipoRadio = "Grande";

          $("#infoSimu").empty();
          $(
            "<span> Estado: </span>" +
              nombreEstado +
              "<br/>" +
              "<span>[Condado]: [buffer/total] habitantes </span><br/>" +
              counties +
              "<span>Suma total = </span>" +
              total_population +
              " habitantes <br/>"
          ).appendTo("#infoSimu");
        });
      }

      // Se dibuja la capa con el móvil y el buffer
      map.addLayer(movilLayer);

      var velocidad;

      if ($("#vbaja")[0].checked) {
        velocidad = 6000;
        simboloMovil.setColor(new Color([0, 92, 230, 1]));
      } else if ($("#vmedia")[0].checked) {
        velocidad = 5000;
        simboloMovil.setColor(new Color([255, 255, 0, 1]));
      } else if ($("#valta")[0].checked) {
        velocidad = 4200;
        simboloMovil.setColor(new Color([230, 0, 0, 0.95]));
      }
      // Velocidad del móvil
      setTimeout(moverMovil, velocidad);
    } else {
      movilLayer.clear();
      alert("La simulación ha sido finalizada con éxito");
    }
  }

  on(dom.byId("stop"), "click", stopSimulacion);

  function stopSimulacion() {
    terminar = true;
    $("#stop").prop("disabled", true);
    $("#start").prop("disabled", false);
    $("#borrarRutaBtn").prop("disabled", false);
    $("#ptosList").prop("hidden", false);
    $("#infoList").prop("hidden", true);
  }

  /**************************************************PRINTER******************************************************************************************************* */
  var printer = new Print(
    {
      map: map,
      url:
        "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
      templates: [
        {
          label: "Layout",
          format: "PDF",
          layout: "A4 Portrait",
          layoutOptions: {
            titleText: "SIG 2019 - Laboratorio 2",
            authorText: "Grupo 2",
            copyrightText: "SIG"
          },
          exportOptions: {
            width: 640,
            height: 480,
            dpi: 96
          }
        }
      ]
    },
    dom.byId("printButton")
  );
  printer.startup();
});
