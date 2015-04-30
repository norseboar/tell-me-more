"use strict"

// Module for running a tutorial introducing a user to Context
// This tutorial shows popups on whatever page they're on to show them
// how context can be used
var context = context || {};

context.runTutorial = (function($) {
  // we can't return the funtion directly, because we need jQuery
  return function() {
    var autoshowEnabled = true;

    // TUTORIAL PROGRESS ======================================================
    // These functions are not automatically run, rather they are called as
    // the tutorial progresses
    var runStep1 = function() {
      // center pane
      var xPos = ($(window).width() - context.TUTORIAL_WIDTH)/2;
      var yPos = ($(window).height() - context.TUTORIAL_HEIGHT)/3;
      tutorialPane.moveCustom(xPos, yPos, context.TUTORIAL_WIDTH, 'animate');

      // Empty pane and load in new content
      tutorialPane.empty();
      var iframe = $('<iframe src="' +
          chrome.extension.getURL('/templates/tutorial1.html') +
          '" width="' + context.TUTORIAL_WIDTH + '" height="' +
          context.TUTORIAL_HEIGHT + '"></iframe>');
      tutorialPane.appendContent(iframe, context.TUTORIAL_HEIGHT);
    };

    var runStep2 = function() {
      tutorialPane.empty();
      var iframe = $('<iframe src="' +
          chrome.extension.getURL('/templates/tutorial2.html') +
          '" width="' + context.TUTORIAL_WIDTH + '" height="' +
          380 + 'px"></iframe>');
      tutorialPane.appendContent(iframe, context.TUTORIAL_HEIGHT);
    };

    var runStep3 = function() {
      tutorialPane.empty();
      var iframe = $('<iframe src="' +
          chrome.extension.getURL('/templates/tutorial3.html') +
          '" width="' + context.TUTORIAL_WIDTH + '" height="' +
          context.TUTORIAL_HEIGHT + '"></iframe>');
      tutorialPane.appendContent(iframe, context.TUTORIAL_HEIGHT);
    };


    // INITIALIZE AND DISPLAY PANE ============================================
    // If the user is in the middle of the tutorial, some things behave
    // differently

    // first, get the appropriate location for tutorial popup
    var window_width = $(window).width();
    var width = context.TUTORIAL_WIDTH;

    var xPos = window_width - (context.PANE_PADDING_WIDTH*2) - width;
    var yPos = context.PANE_PADDING_HEIGHT*3;

    var tutorialBranding = $('<iframe src="' +
        chrome.extension.getURL('/templates/tutorial-branding.html') +
        '" width="' + context.TUTORIAL_WIDTH + '" height="' +
        context.BRANDING_HEIGHT + '"></iframe>');

    var tutorialPane = new context.HoverPane({
      sticky: true,
      brandingContent: tutorialBranding,
      fixed: true
    });
    // tutorial pane must have Z dialed back so that other hovercards overlap
    // it when the user is experimenting
    tutorialPane.setZ(tutorialPane.getZ() - 1);
    tutorialPane.moveCustom(xPos, yPos, width, 0);
    var iframe = $('<iframe src="' +
        chrome.extension.getURL('/templates/tutorial-intro.html') +
        '" width="' + tutorialPane.getWidth() + '" height="' +
        context.TUTORIAL_INTRO_HEIGHT + '"></iframe>');
    tutorialPane.appendContent(iframe);

    // SET UP DEMO PANE =======================================================
    // Rather than interfering with the default hoverpane that the main content
    // script manages, create a 'demo pane' that will be hovered next to the
    // tutorial pane
    var demoBranding = $('<iframe src="' +
        chrome.extension.getURL('/templates/demo-branding.html') +
        '" width="' + context.MAX_WIDTH + '" height="' +
        context.BRANDING_HEIGHT + '"></iframe>');
    var demoPane = new context.HoverPane({
      brandingContent: demoBranding
    });

    // SET UP LISTENERS =======================================================
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(sender.id !== chrome.runtime.id) {
          return;
        }

        // Listen for a message to kill the tutorial
        // When the user interacts with a tutorial on one page, all other
        // tutorials are killed (for example, if the user opens five tabs in
        // quick sequence, the tutorials on all pages but the one the user is actively using should
        // be killed as quickly as possible)
        if(request.action === 'killTutorial') {
          tutorialPane.hide();
        }

        // Listeners for messages coming from the tutorial iframes
        if(request.action === 'tutorial-close') {
          tutorialPane.hide();
        }
        if(request.action === 'tutorial-step1') {
          runStep1();
        }
        if(request.action === 'tutorial-step2') {
          runStep2();
        }
        if(request.action === 'tutorial-step3') {
          runStep3();
        }
        if(request.action === 'tutorial-end') {
          tutorialPane.hide();
        }
        if(request.action === 'tutorial-create-hoverpane') {
          // Check if user has banned autoshow
          if(request.autoshow === true && !autoshowEnabled) {
            return;
          }
          context.contentRetriever.insertDataIntoPane(request.query,
              demoPane, tutorialPane.pane);
        }
        if(request.action === 'tutorial-close-demo') {
          demoPane.hide();
        }

        if(request.action === 'blacklist-demo') {
          autoshowEnabled = false;
          demoPane.hide();
        }
      }
    );
  };
})(jQuery);
