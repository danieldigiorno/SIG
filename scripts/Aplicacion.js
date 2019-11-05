 var map;

      require(["esri/map",
        "esri/layers/ArcGISTiledMapServiceLayer", 
        "esri/geometry/Point",
        "esri/SpatialReference",
        "dojo/domReady!"], function(Map,ArcGISTiledMapServiceLayer,Point,SpatialReference) {
        map = new Map("map", {
          fadeOnZoom: true,
          center: [-95,39], // longitude, latitude
           zoom:4, 
          minZoom:4,
          smartNavigation:false
        });
        var tiled = new ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer");
          map.addLayer(tiled);

      });
