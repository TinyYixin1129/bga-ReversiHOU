/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * ReversiHOU implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * reversihou.js
 *
 * ReversiHOU user interface script
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
  "dojo",
  "dojo/_base/declare",
  "ebg/core/gamegui",
  "ebg/counter",
  getLibUrl("bga-animations", "1.x"),
], function (dojo, declare, gamegui, counter, BgaAnimations) {
  return declare("bgagame.reversihou", ebg.core.gamegui, {
    constructor: function () {
      console.log("reversihou constructor");

      // Here, you can init the global variables of your user interface
      // Example:
      // this.myGlobalValue = 0;
    },

    /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */

    setup: function (gamedatas) {
      console.log("Starting game setup");

      // Example to add a div on the game area
      this.getGameAreaElement().insertAdjacentHTML(
        "beforeend",
        `
          <div id="player-tables"></div>
        `
      );
      this.getGameAreaElement().insertAdjacentHTML(
        "beforeend",
        `
          <div id="board">
          </div>
        `
      );

      // Setting up player boards
      Object.values(gamedatas.players).forEach((player) => {
        // example of setting up players boards
        this.getPlayerPanelElement(player.id).insertAdjacentHTML(
          "beforeend",
          `
          <div id="player-counter-${player.id}">
            ${player.color === "ffffff" ? "white" : "black"}
          </div>
                `
        );

        // example of adding a div for each player
        // document.getElementById("player-tables").insertAdjacentHTML(
        //   "beforeend",
        //   `
        //             <div id="player-table-${player.id}">
        //                 <strong>${player.name}</strong>
        //                 <div>Player zone content goes here</div>
        //             </div>
        //         `
        // );
      });

      // TODO: Set up your game interface here, according to "gamedatas"
      const board = document.getElementById("board");
      const hor_scale = 64.8;
      const ver_scale = 64.4;

      for (let x = 1; x <= 8; x++) {
        for (let y = 1; y <= 8; y++) {
          const left = Math.round((x - 1) * hor_scale + 10);
          const top = Math.round((y - 1) * ver_scale + 7);

          board.insertAdjacentHTML(
            "afterbegin",
            `<div id="square_${x}_${y}" class="square" style="left: ${left}px; top: ${top}px;"></div>`
          );
        }
      }

      this.animationManager = new BgaAnimations.Manager({
        animationsActive: () => this.bgaAnimationsActive(),
      });

      for (var i in gamedatas.board) {
        var square = gamedatas.board[i];

        if (square.player !== null) {
          this.addDiscOnBoard(square.x, square.y, square.player);
        }
      }

      document
        .querySelectorAll(".square")
        .forEach((square) =>
          square.addEventListener("click", (e) => this.onPlayDisc(e))
        );

      // Setup game notifications to handle (see "setupNotifications" method below)
      this.setupNotifications();

      console.log("Ending game setup");
    },

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    onEnteringState: function (stateName, args) {
      console.log("Entering state: " + stateName, args);

      switch (stateName) {
        case "playerTurn":
          this.updatePossibleMoves(args.args.possibleMoves);
          break;
      }
    },

    updatePossibleMoves: function (possibleMoves) {
      // Remove current possible moves
      document
        .querySelectorAll(".possibleMove")
        .forEach((div) => div.classList.remove("possibleMove"));

      for (var x in possibleMoves) {
        for (var y in possibleMoves[x]) {
          // x,y is a possible move
          document
            .getElementById(`square_${x}_${y}`)
            .classList.add("possibleMove");
        }
      }

      this.addTooltipToClass("possibleMove", "", _("Place a disc here"));
    },
    // onLeavingState: this method is called each time we are leaving a game state.
    //                 You can use this method to perform some user interface changes at this moment.
    //
    onLeavingState: function (stateName) {
      console.log("Leaving state: " + stateName);

      switch (stateName) {
        /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */

        case "dummy":
          break;
      }
    },

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons: function (stateName, args) {
      console.log("onUpdateActionButtons: " + stateName, args);

      if (this.isCurrentPlayerActive()) {
        switch (stateName) {
          case "playerTurn":
            // const playableCardsIds = args.playableCardsIds; // returned by the argPlayerTurn

            // // Add test action buttons in the action status bar, simulating a card click:
            // playableCardsIds.forEach((cardId) =>
            //   this.statusBar.addActionButton(
            //     _("Play card with id ${card_id}").replace("${card_id}", cardId),
            //     () => this.onCardClick(cardId)
            //   )
            // );

            // this.statusBar.addActionButton(
            //   _("Pass"),
            //   () => this.bgaPerformAction("actPass"),
            //   { color: "secondary" }
            // );
            break;
        }
      }
    },

    ///////////////////////////////////////////////////
    //// Utility methods

    /*
        
            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.
        
        */
    addDiscOnBoard: async function (x, y, playerId, animate = true) {
      const color = this.gamedatas.players[playerId].color;
      const discId = `disc_${x}_${y}`;

      document.getElementById(`square_${x}_${y}`).insertAdjacentHTML(
        "beforeend",
        `
        <div class="disc" data-color="${color}" id="${discId}">
            <div class="disc-faces">
                <div class="disc-face" data-side="white"></div>
                <div class="disc-face" data-side="black"></div>
            </div>
        </div>
      `
      );

      if (animate) {
        const element = document.getElementById(discId);
        await this.animationManager.fadeIn(
          element,
          document.getElementById(`overall_player_board_${playerId}`)
        );
      }
    },
    ///////////////////////////////////////////////////
    //// Player's action

    /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */

    onPlayDisc: function (evt) {
      // Stop this event propagation
      evt.preventDefault();
      evt.stopPropagation();

      // Get the cliqued square x and y
      // Note: square id format is "square_X_Y"
      var coords = evt.currentTarget.id.split("_");
      var x = coords[1];
      var y = coords[2];

      if (
        !document
          .getElementById(`square_${x}_${y}`)
          .classList.contains("possibleMove")
      ) {
        // This is not a possible move => the click does nothing
        return;
      }

      this.bgaPerformAction("actPlayDisc", {
        x: x,
        y: y,
      });
    },

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your reversihou.game.php file.
        
        */
    setupNotifications: function () {
      console.log("notifications subscriptions setup");

      // automatically listen to the notifications, based on the `notif_xxx` function on this class.
      this.bgaSetupPromiseNotifications();
    },

    notif_playDisc: async function (args) {
      // Remove current possible moves (makes the board more clear)
      document
        .querySelectorAll(".possibleMove")
        .forEach((div) => div.classList.remove("possibleMove"));

      await this.addDiscOnBoard(args.x, args.y, args.player_id);
    },

    animateTurnOverDisc: async function (disc, targetColor) {
      const squareDiv = document.getElementById(`square_${disc.x}_${disc.y}`);
      const discDiv = document.getElementById(`disc_${disc.x}_${disc.y}`);

      squareDiv.classList.add("flip-animation");
      await this.wait(500); // for the flip animation to finish

      discDiv.dataset.color = targetColor;

      const parallelAnimations = [
        {
          keyframes: [
            // flip the disc
            { transform: `rotateY(180deg)` },
            { transform: `rotateY(0deg)` },
          ],
        },
        {
          keyframes: [
            // lift the disc
            { transform: `translate(0, -12px) scale(1.2)`, offset: 0.5 },
          ],
        },
      ];

      await this.animationManager.slideAndAttach(discDiv, squareDiv, {
        duration: 1000,
        parallelAnimations,
      });

      squareDiv.classList.remove("flip-animation");
      await this.wait(500); // for the flip animation removal to finish
    },

    notif_turnOverDiscs: async function (args) {
      // Custom sound effect
      // if (
      //   this.getGameUserPreference(this.preference_sound) == 1 &&
      //   !g_archive_mode
      // ) {
      //   this.sounds.play("play");
      //   this.disableNextMoveSound();
      // }

      // Update score
      Object.entries(args.scores).forEach(([playerId, newScore]) => {
        this.scoreCtrl[playerId].toValue(newScore);
      });

      // Get the color of the player who is returning the discs
      const targetColor = this.gamedatas.players[args.player_id].color;
      // wait for the animations of all turned discs to be over before considering the notif done
      await Promise.all(
        args.turnedOver.map((disc) =>
          this.animateTurnOverDisc(disc, targetColor)
        )
      );
    },

    notif_newScores: async function (args) {
      for (var player_id in args.scores) {
        var newScore = args.scores[player_id];
        this.scoreCtrl[player_id].toValue(newScore);
      }
    },
  });
});
