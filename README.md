# Electrometeor
## Overview
Electrometeor combines **[Electron](http://electron.atom.io)** and **[Meteor](http://www.meteor.com)** to allow you to easily create desktop applications that work both 100% offline & online.

## Getting Started

In order to get started, you'll need to clone this repo to `<your-app>` then use the setup script to setup your app:
```sh
$ git clone git@github.com:sircharleswatson/Electrometeor.git <your-app>
$ cd <your-app>
$ ./script/setup.sh
```

(**Note:** You will also want to remove `.git` with the command: `$ rm -rf .git`)

Once you've done that, you can run the app locally with the following command:
```sh
$ ./script/run.sh
```

#### Developing your Meteor application

While the `run.sh` script is active, you should be able to see any changes you make to your Meteor app in much the same way you would if you were developing a web app. In fact, you can even navigate to `http://localhost:3000` in your browser and you will see it there as well.

Development of your Meteor application is pretty much the same as usual. There are however, some things you can do that you wouldn't normally be able to do with a web app. For example, you could use [node-applescript](https://github.com/TooTallNate/node-applescript) on the Meteor server to create an iTunes controller.

#### Deploying your Meteor application
When you're ready, you can build your app for distribution by simply running `./script/dist.sh`.

### Working with Electron
In it's current form, Electrometeor is meant to be very simple. If you wish to develop the Electron side of things further in your app, please refer to their wonderful [docs](https://github.com/atom/electron/tree/master/docs).

## Goals for Electrometeor

My goal for Electrometeor is to make it the best boilerplate for making desktop applications with Meteor. It is very simple at the moment but I intend on adding more features that Electron has in place for easily integrating apps with the desktop.

### Examples
If you use Electrometeor, please let me know and I will add your example here!

-----------
### Need Help?
Right now, I do not know much about Electron specifically but I can try to answer any questions you may have. I'm also available for any questions you may have regarding Meteor. You can contact me through Gitter in the Electrometeor room or via direct message.

[![Gitter](https://img.shields.io/badge/GITTER-join%20chat-green.svg?style=flat-square)](https://gitter.im/sircharleswatson/Electrometeor)

#### TODO
----------
* [] Decide TODOS

#### Credits
------------
Electrometeor is mostly made possible by reusing code from the [Kitematic](https://github.com/kitematic/kitematic) app. Also many thanks to GitHub for creating **[Electron](http://electron.atom.io)** and to MDG for all the work they do on **[Meteor](http://meteor.com)**


