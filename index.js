mapboxgl.accessToken = 'pk.eyJ1IjoidmFsZXJpYWJlbG91c292YSIsImEiOiJjanBmMmt0c2cwNjQyM3FsZ2gzY2dvemNvIn0.skr82NeiNVFPUi-zxKKqiw';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/valeriabelousova/ck9dksicn07z31jnpx9461nbd',
        center: [37.583338, 55.788196],
        zoom: 15.5,
        pitch: 45,
        bearing: -17.6,
        container: 'map',
        antialias: true,
        renderWorldCopies: true,
        minZoom: 1,
        antialias: true
    });
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-right');

map.on('load', function() {
    map.on('render', (e) => {
        if (e.target.getZoom() < 15) {
            map.flyTo({
                center: e.target.getCenter(), 
                zoom: e.target.getZoom(),
                bearing: 0,
                pitch: 0
            })
        }
        else {
            map.flyTo({
                center: e.target.getCenter(), 
                zoom: e.target.getZoom(),
                bearing: -17.6,
                pitch: 45
            })
        }
        if (e.target.getZoom() < 13.7) {
            map.setLayoutProperty('3d-model', 'visibility', 'none')
        }
        else {
            map.setLayoutProperty('3d-model', 'visibility', 'visible')
        }
    });
    
    // Add pulsing dot
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
        
    map.addSource('points', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [37.583338, 55.788196]
                }
            }]
        }
    });
    map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
            'icon-image': 'pulsing-dot'
        }
    });
    // Create a popup, but don't add it to the map yet.
    var markerHeight = 25;
        var popupOffsets = {
        'top': [0, markerHeight],
        'bottom': [0, -markerHeight],
        'left': [markerHeight, 0],
        'right': [-markerHeight, 0]
        };

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: popupOffsets,
        className: 'emg-popup-class'
        });
    map.on('mousemove', 'points', function(e) {
        map.getCanvas().style.cursor = 'pointer';
        var coordinates = e.features[0].geometry.coordinates.slice();
        popup
            .setLngLat(coordinates)
            .setHTML('<h3>Единая Медиа Группа</h3><p>Москва, ул. Правды, дом 24, стр. 3,<br> 5 этаж</p>')
            .addTo(map);
        });
    map.on('mouseleave', 'points', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
        });

    // Add EMG marker
    var coordEMG = [37.583338, 55.788196];
        // create DOM element for the marker
        var iconEMG = document.createElement('div');
        iconEMG.id = 'markerEMG';
        // create the marker
        new mapboxgl.Marker(iconEMG)
            .setLngLat(coordEMG)
            .addTo(map);
        // document.getElementById('markerEMG').addEventListener('click', function() {
        //     map.on('render', (e) => {
        //     map.flyTo({
        //         center: [37.583338, 55.788196],
        //         zoom: 14,
        //         essential: true // this animation is considered essential with respect to prefers-reduced-motion
        //         });
        //     })
        // });
    
    // Add 3D building
    var layers = map.getStyle().layers;
     
    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
        labelLayerId = layers[i].id;
        break;
        }
    }  
    map.addLayer( {
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#fff',
            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
            ],
            'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
        }
    },
        labelLayerId
        );
    ///////////////////////////////////////////////////////////
    const routes = [
        {routeUrl: 'https://raw.githubusercontent.com/ValeriaBelousova/temp/master/data/bel_green.geojson', id: 'sav_kalin'},
        {routeUrl: 'https://raw.githubusercontent.com/ValeriaBelousova/temp/master/data/sav_tim.geojson', id: 'sav_tim'},
        {routeUrl: 'https://raw.githubusercontent.com/ValeriaBelousova/temp/master/data/bel_kolt.geojson', id: 'bel_kolt'},
        {routeUrl: 'https://raw.githubusercontent.com/ValeriaBelousova/temp/master/data/bel_green.geojson', id: 'bel_green'},
    ]
    routes.map(route => {
        map.addSource(route.id, {
                'type': 'geojson',
                'data': route.routeUrl
                });
                map.addLayer({
                    'id': route.id,
                    'type': 'line',
                    'source': route.id,
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': '#0057fe',
                        'line-width': 4
                    },
                    'minzoom': 13.3
                },
                'state-label');

        map.on('mousemove', route.id, function(e) {
            map.setPaintProperty(route.id, 'line-color', '#01c348');
        });
        map.on('mouseleave', route.id, function() {
            map.setPaintProperty(route.id, 'line-color', '#0057fe');
        });
        map.on('render', (e) => {
            if (e.target.getZoom() < 15) {
                map.setPaintProperty(route.id, 'line-width', 3);
            }
            else {
                map.setPaintProperty(route.id, 'line-width', 4);
            }
        });
    })
    ////////////////////////////////////////////////////////////////////
    const images =[
        {imageUrl: 'https://raw.githubusercontent.com/ValeriaBelousova/ValeriaBelousova.github.io/master/icon/Gray.png', id: 'metroSavTim'},
        {imageUrl: 'https://raw.githubusercontent.com/ValeriaBelousova/ValeriaBelousova.github.io/master/icon/Cyan.png', id: 'metroSavBKL'},
        {imageUrl: 'https://raw.githubusercontent.com/ValeriaBelousova/ValeriaBelousova.github.io/master/icon/Green.png', id: 'metroBelZam'},
        {imageUrl: 'https://raw.githubusercontent.com/ValeriaBelousova/ValeriaBelousova.github.io/master/icon/Brown.png', id: 'metroBelKolt'},
      ]
      Promise.all(
          images.map(img => new Promise((resolve, reject) => {
              map.loadImage(img.imageUrl, function(error, res) {
                  map.addImage(img.id, res);
                  resolve();
              });
          }))
      ).then(losdIcon);
      
      function losdIcon() {
          var geojsonAr = [
              {
              'type': 'Feature',
              'properties': {
                  'description':'<h3>Савёловская</h3><p>Серпуховско-Тимирязевская линия,<br> выход 7</p>',
                  'icon': 'metroSavTim',
              },
              'geometry': {
              'type': 'Point',
              'coordinates': [37.588866699638551, 55.794305699987795]
              }
              },
              {
              'type': 'Feature',
              'properties': {
                  'description':'<h3>Савёловская</h3><p>Каховская линия,<br> выход 2</p>',
                  'icon': 'metroSavBKL',
              },
              'geometry': {
              'type': 'Point',
              'coordinates': [37.584272307440429, 55.793511827857316]
              }
              },
              {
              'type': 'Feature',
              'properties': {
                  'description':'<h3>Белорусская</h3><p>Замоскворецкая линия,<br> выход 4</p>',
                  'icon': 'metroBelZam',
              },
              'geometry': {
              'type': 'Point',
              'coordinates': [37.58216247020885, 55.777529108970377]
              }
              },
              {
              'type': 'Feature',
              'properties': {
                  'description':'<h3>Белорусская</h3><p>Кольцевая линия,<br> выход 3</p>',
                  'icon': 'metroBelKolt',
              },
              'geometry': {
              'type': 'Point',
              'coordinates': [37.58617350011108, 55.777656399788064]
              }
              }
              ];
      
        map.addSource('markers', {
            type: 'geojson',
            data: {
                'type': 'FeatureCollection',
                'features': geojsonAr
            }
        });
      
        map.addLayer({
            'id': 'markers',
            'interactive': true,
            'source': 'markers',
            'type': 'symbol',
            'minzoom': 12.8,
            'layout': {
                'icon-image': ['get', 'icon'],
                'icon-size': 0.25
            }
        });
      ///////////////////////   POPUP for ICON   ////////////////////////////////
        var markerHeight = 25;
        var popupOffsets = {
            'top': [0, markerHeight],
            'bottom': [0, -markerHeight],
            'left': [markerHeight, 0],
            'right': [-markerHeight, 0]
        };
        var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: popupOffsets,
            className: 'metro-popup-class'
            });
        map.on('mouseenter', 'markers', function(e) {
            map.getCanvas().style.cursor = 'pointer';
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.description;
          
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
          
            popup
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
        });
          
          // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'markers', function() {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
      };
      ///////////////////////   end POPUP for ICON   ////////////////////////////////
    });
    // Add 3D model
    // parameters to ensure the model is georeferenced correctly on the map
    var modelOrigin = [37.5828925, 55.78744];
    var modelAltitude = 0;
    var modelRotate = [Math.PI / 2, 0, 0];

    var modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
    );

    // transformation parameters to position, rotate and scale the 3D model onto the map
    var modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        /* Since our 3D model is in real world meters, a scale transform needs to be
        * applied since the CustomLayerInterface expects units in MercatorCoordinates.
        */
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };

    var THREE = window.THREE;

    // configuration of the custom layer for a 3D model per the CustomLayerInterface
    var customLayer = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function(map, gl) {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();

    // create two three.js lights to illuminate the model
            var directionalLight = new THREE.DirectionalLight(0xffffff);
            directionalLight.position.set(0, -70, 100).normalize();
            this.scene.add(directionalLight);
        
            var directionalLight2 = new THREE.DirectionalLight(0xffffff);
            directionalLight2.position.set(0, 70, 100).normalize();
            this.scene.add(directionalLight2);

    // use the three.js GLTF loader to add the 3D model to the three.js scene
            var loader = new THREE.GLTFLoader();
            loader.load(
                'https://raw.githubusercontent.com/ValeriaBelousova/3d-model/master/test_02_60.gltf',
                function(gltf) {
                    this.scene.add(gltf.scene);
                }.bind(this)
            );
            this.map = map;

    // use the Mapbox GL JS map canvas for three.js
            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });

        this.renderer.autoClear = false;
        },
        render: function(gl, matrix) {
            var rotationX = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(1, 0, 0),
            modelTransform.rotateX
            );
            var rotationY = new THREE.Matrix4().makeRotationAxis(
            new THREE.Vector3(0, 1, 0),
            modelTransform.rotateY
            );
            var rotationZ = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 0, 1),
                modelTransform.rotateZ
            );
        
            var m = new THREE.Matrix4().fromArray(matrix);
            var l = new THREE.Matrix4()
            .makeTranslation(
                modelTransform.translateX,
                modelTransform.translateY,
                modelTransform.translateZ
            )
            .scale(
                new THREE.Vector3(
                    modelTransform.scale,
                    -modelTransform.scale,
                    modelTransform.scale
                )
            )
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);
        
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
        }
    };

    map.on('style.load', function() {
        map.addLayer(customLayer, 'country-label');
    });
    ///////////////////////////////////////////////////////////////////////////////////////////////
    
    //////////////////////////// ADD PULSING DOT //////////////////////////////////////////////////
    var size = 300;
    
    var pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),
        
        // get rendering context for the map canvas when layer is added to the map
        onAdd: function() {
            var canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
        },
    
    // called once before every frame where the icon will be used
    render: function() {
        var duration = 1500;
        var t = (performance.now() % duration) / duration;
        
        var radius = (size / 2) * 0.3;
        var outerRadius = (size / 2) * 0.7 * t + radius;
        var context = this.context;
        
        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(0, 87, 254,' + (1 - t) + ')';
        context.fill();
        
        // draw inner circle
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(0, 100, 250, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();
        
        // update this image's data with data from the canvas
        this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
        ).data;
        
        // continuously repaint the map, resulting in the smooth animation of the dot
        map.triggerRepaint();
        
        // return `true` to let the map know that the image was updated
        return true;
        }
    };

