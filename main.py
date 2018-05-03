from __future__ import division
from bokeh.core.properties import Instance, String
from bokeh.models import ColumnDataSource, LayoutDOM, CustomJS, Plot, Range1d
import numpy as np
from bokeh.plotting import figure, curdoc
from sklearn.manifold import TSNE
from bokeh.models.glyphs import ImageURL
from os.path import join, basename
import logging
import base64
import cv2
from bokeh.layouts import row, column
from bokeh.models.widgets import Button

class Surface3d(LayoutDOM):
    JS_CODE = """
# This file contains the JavaScript (CoffeeScript) implementation
# for a Bokeh custom extension. The "surface3d.py" contains the
# python counterpart.
#
# This custom model wraps one part of the third-party vis.js library:
#
#     http://visjs.org/index.html
#
# Making it easy to hook up python data analytics tools (NumPy, SciPy,
# Pandas, etc.) to web presentations using the Bokeh server.

# These "require" lines are similar to python "import" statements
import * as p from "core/properties"
import {LayoutDOM, LayoutDOMView} from "models/layouts/layout_dom"

# This defines some default options for the Graph3d feature of vis.js
# See: http://visjs.org/graph3d_examples.html for more details.
OPTIONS =
  width:  '700px'
  height: '700px'
  style: 'dot-color'
  showPerspective: true
  showGrid: true
  keepAspectRatio: true
  verticalRatio: 1.0
  showLegend: false
  cameraPosition:
    horizontal: -0.35
    vertical: 0.22
    distance: 1.8
  dotSizeRatio: 0.01
  tooltip: (point) -> return '<div>
  <div>
                <img
                    src="' + point.data.imgs + '" height="70" alt="' + point.data.imgs + '" width="70"
                    
                    
                ></img>
            </div>
        </div>'




# To create custom model extensions that will render on to the HTML canvas
# or into the DOM, we must create a View subclass for the model. Currently
# Bokeh models and views are based on BackBone. More information about
# using Backbone can be found here:
#
#     http://backbonejs.org/
#
# In this case we will subclass from the existing BokehJS ``LayoutDOMView``,
# corresponding to our
export class Surface3dView extends LayoutDOMView

  initialize: (options) ->
    super(options)

    url = "http://visjs.org/dist/vis.js"

    script = document.createElement('script')
    script.src = url
    script.async = false
    script.onreadystatechange = script.onload = () => @_init()
    document.querySelector("head").appendChild(script)

  _init: () ->
    # Create a new Graph3s using the vis.js API. This assumes the vis.js has
    # already been loaded (e.g. in a custom app template). In the future Bokeh
    # models will be able to specify and load external scripts automatically.
    #
    # Backbone Views create <div> elements by default, accessible as @el. Many
    # Bokeh views ignore this default <div>, and instead do things like draw
    # to the HTML canvas. In this case though, we use the <div> to attach a
    # Graph3d to the DOM.
    @_graph = new vis.Graph3d(@el, @get_data(), OPTIONS)

    # Set Backbone listener so that when the Bokeh data source has a change
    # event, we can process the new data
    @connect(@model.data_source.change, () =>
        @_graph.setData(@get_data())
    )

  # This is the callback executed when the Bokeh data has an change. Its basic
  # function is to adapt the Bokeh data source to the vis.js DataSet format.
  get_data: () ->
    data = new vis.DataSet()
    source = @model.data_source
    for i in [0...source.get_length()]
      data.add({
        x:     source.get_column(@model.x)[i]
        y:     source.get_column(@model.y)[i]
        z:     source.get_column(@model.z)[i]
        extra: source.get_column(@model.extra)[i]
        imgs:  source.get_column(@model.imgs)[i]
        style: source.get_column(@model.color)[i]
      })
    return data

# We must also create a corresponding JavaScript Backbone model sublcass to
# correspond to the python Bokeh model subclass. In this case, since we want
# an element that can position itself in the DOM according to a Bokeh layout,
# we subclass from ``LayoutDOM``
export class Surface3d extends LayoutDOM

  # This is usually boilerplate. In some cases there may not be a view.
  default_view: Surface3dView

  # The ``type`` class attribute should generally match exactly the name
  # of the corresponding Python class.
  type: "Surface3d"

  # The @define block adds corresponding "properties" to the JS model. These
  # should basically line up 1-1 with the Python model class. Most property
  # types have counterparts, e.g. ``bokeh.core.properties.String`` will be
  # ``p.String`` in the JS implementatin. Where the JS type system is not yet
  # as rich, you can use ``p.Any`` as a "wildcard" property type.
  @define {
    x:           [ p.String           ]
    y:           [ p.String           ]
    z:           [ p.String           ]
    color:       [ p.String           ]
    extra:       [ p.String           ]
    imgs:        [ p.String           ] 
    data_source: [ p.Instance         ]
  }
"""
    # The special class attribute ``__implementation__`` should contain a string
    # of JavaScript (or CoffeeScript) code that implements the JavaScript side
    # of the custom extension model.
    __implementation__ = JS_CODE

    # Below are all the "properties" for this model. Bokeh properties are
    # class attributes that define the fields (and their types) that can be
    # communicated automatically between Python and the browser. Properties
    # also support type validation. More information about properties in
    # can be found here:
    #
    #    https://bokeh.pydata.org/en/latest/docs/reference/core.html#bokeh-core-properties

    # This is a Bokeh ColumnDataSource that can be updated in the Bokeh
    # server by Python code
    data_source = Instance(ColumnDataSource)

    # The vis.js library that we are wrapping expects data for x, y, z, and
    # color. The data will actually be stored in the ColumnDataSource, but
    # these properties let us specify the *name* of the column that should
    # be used for each field.
    x = String
    y = String
    z = String
    extra = String
    color = String
    imgs = String
    
class Model(object):
    
    surface = None
    _upload_js = """
function read_file(filename) {
    var reader = new FileReader();
    reader.onload = load_handler;
    reader.onerror = error_handler;
    // readAsDataURL represents the file's data as a base64 encoded string
    reader.readAsDataURL(filename);
}

function load_handler(event) {
    var b64string = event.target.result;
    source.data = {'contents' : [b64string], 'name':[input.files[0].name]};
    source.change.emit()
}

function error_handler(evt) {
    if(evt.target.error.name == "NotReadableError") {
        alert("Can't read file!");
    }
}

var input = document.createElement('input');
input.setAttribute('type', 'file');
input.onchange = function(){
    if (window.FileReader) {
        read_file(input.files[0]);
    } else {
        alert('FileReader is not supported in this browser');
    }
}
input.click();
"""
    
    def callback(self, fname):
        self.weights = np.load("Eigenfaces/weights.npy")
        self.mean_img_col = np.load("Eigenfaces/mean.npy")
        self.evectors = np.load("Eigenfaces/eigenfaces.npy")
        self.faces_paths = np.load("Eigenfaces/faces_paths.npy").astype(str)
        self.faces_paths= np.append(self.faces_paths, "Eigenfaces/static/tmp.jpg")
        
        #print(self.faces_paths)
        
        img = cv2.imread("Eigenfaces/static/tmp.jpg", 0)                                          # read as a grayscale image
        img_col = np.array(img, dtype='float64').flatten()                      # flatten the image
        img_col -= self.mean_img_col                                            # subract the mean column
        img_col = np.reshape(img_col, (92*112, 1))                              # from row vector to col vector
        
        #print("shape of img to be classified: " + str(img_col.shape))
        #print("shape of evectors: " + str(self.evectors.shape))
        
        S = self.evectors.transpose().dot(img_col)                                 # projecting the normalized probe onto the
                                                                                   # Eigenspace, to find out the weights
        
        #print("Shape of weights before: " + str(self.weights.shape))
        #print("Shape of S: " + str(S.shape))
        
        diff = self.weights - S                                                       # finding the min ||W_j - S||
        norms = np.linalg.norm(diff, axis=0)
        closest_face_id = np.argmin(norms)                                      # the id [0..240) of the minerror face to the sample
        
        self.weights = np.append(self.weights, S.transpose(), axis=0)
        
       # p = figure()
        #p.image_url(url=["Eigenfaces/static/tmp.jpg"], w=10, h=10, x=0, y=1)
        
        #print("before TSNE" + str(self.weights.shape))
        tsne = TSNE(n_components = 3, random_state = 12)
        new_weights_tsne = tsne.fit_transform(self.weights)
        #print("after TSNE" + str(new_weights_tsne.shape))

        X_data = new_weights_tsne[:, 0]
        #print("first axis" + str(X_data.shape))
        Y_data = new_weights_tsne[:, 1]
        #print("first axis" + str(Y_data.shape))
        Z_data = new_weights_tsne[:, 2]
        #print("third axis" + str(Z_data.shape))

        length = new_weights_tsne.shape[0]
        color = np.asarray([1 for x in range(length-1)]+[0 for x in range(length-1, length)])
        extra = np.asarray([0 for x in range(length)])
        
        source = ColumnDataSource(data=dict(x=X_data, y=Y_data, z=Z_data, color=color, extra=extra, imgs=self.faces_paths))
        
        xdr = Range1d(start=0, end=10)
        ydr = Range1d(start=0, end=10)
        
        plot = Plot(title=None,x_range=xdr, y_range=ydr, plot_width=100, plot_height=100, h_symmetry=False, v_symmetry=False, min_border=0, toolbar_location=None)
        
        image1 = ImageURL(url="Eigenfaces/static/tmp.jpg", x=0, y=1, w=20, h=20, anchor="top_left")
        plot.add_glyph(image1)

        image2 = ImageURL(url="Eigenfaces/static/tmp.jpg", x=0, y=1, w=20, h=20, anchor="top_right")
        plot.add_glyph(image2)
        
        if self.surface is None:
            self.surface = Surface3d(x="x", y="y", z="z", extra="extra", color="color", imgs = "imgs", data_source=source)
            
            curdoc().add_root(row(self.surface))     
        else:
            self.surface.data_source = source
    
    def new_upload_button(self, save_path,
                      callback,
                      name="Eigenfaces/static/tmp.jpg",
                      label="Upload your photo! (.jpg, 92x112)"):
        def file_callback(attr, old, new):
            raw_contents = source.data['contents'][0]
            # remove the prefix that JS adds
            prefix, b64_contents = raw_contents.split(",", 1)
            file_contents = base64.b64decode(b64_contents)
            fname = join(save_path, name)
            
            with open(fname, "wb") as f:
                print(fname)
                f.write(file_contents)
            
            logging.info("Success: file uploaded " + fname)
            callback(fname)
            
        source = ColumnDataSource({'contents': [], 'name': []})
        source.on_change('data', file_callback)
        button = Button(label=label, button_type="success")
        button.callback = CustomJS(args=dict(source=source), code=self._upload_js)
        return button
    
    def __init__(self):
        button = self.new_upload_button(save_path="", callback= self.callback)
        curdoc().add_root(row(button))
        
model = Model()
print("done")