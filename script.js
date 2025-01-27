document.addEventListener("DOMContentLoaded", () => {
	// Éléments DOM
	const startBtn = document.getElementById("start-btn");
	const welcomeScreen = document.getElementById("welcome-screen");
	const sureScreen = document.getElementById("sure-screen");
	const thirdScreen = document.getElementById("third-screen");
	const characterSelection = document.getElementById("character-selection");
	const ouiBtn = document.getElementById("oui");
	const thirdContinueBtn = document.getElementById("third-continue");
	// Elements for the character selection popup
	const characterButtons = document.querySelectorAll(".character-btn");
	const popup = document.getElementById("popup");
	const popupText = document.getElementById("popup-text");
	const popupButtons = document.getElementById("popup-buttons");
	const popupYes = document.getElementById("popup-yes");
	const popupNo = document.getElementById("popup-no");
	const popupContinue = document.getElementById("popup-continue");
	const characterSquares = document.querySelectorAll(".character-square");
	//Comabt
	const combatScreen = document.getElementById("combat-screen");
	const combatContinueBtn = document.getElementById("combat-continue");
	const attackContainer = document.getElementById("attack-container");
	const tutorialPopup = document.getElementById("tutorial-popup");
	const startAttackBtn = document.getElementById("start-attack");
	const combatDialogue = document.getElementById("combat-dialogue");
	const attacks = document.querySelectorAll(".attack");
	const bossHealthDisplay = document.getElementById("boss-health");
	const playerHealthDisplay = document.getElementById("player-health");
	const combatPopup = document.getElementById("combat-popup");
	const combatPopupText = document.getElementById("combat-popup-text");
	const combatPopupClose = document.getElementById("combat-popup-close");

	let bossHealth = 500; // Initial boss health
	let playerHealth = 100; // Initial player health
	const attackCooldowns = {};
	let chargeInProgress = null; // Track the current attack being charged
	let bossSkipTurnsLeft = 0; // Track how many turns the boss should skip

	// Affiche la deuxième page d'accueil
	startBtn.addEventListener("click", () => {
		welcomeScreen.style.display = "none";
		sureScreen.style.display = "block";
	});

	// Passe à la troisième page d'accueil
	ouiBtn.addEventListener("click", () => {
		sureScreen.style.display = "none";
		thirdScreen.style.display = "block";
	});

	// Passe à la sélection des personnages et change le fond en blanc
	thirdContinueBtn.addEventListener("click", () => {
		thirdScreen.style.display = "none";
		characterSelection.style.display = "block";

		// Change le fond de la page en blanc
		document.body.style.backgroundColor = "white";
	});

	// Add event listeners to each square to show the popup
	characterSquares.forEach((square) => {
		square.addEventListener("click", () => {
			popup.style.display = "flex"; // Show the popup
		});
	});

	// Function to handle popup choice
	const handlePopupChoice = () => {
		// Update the popup text
		popupText.textContent =
			"DE TOUTE MANIÈRE TU N'AS PAS LE CHOIX. TU ES OBLIGÉ DE COMMENCER PAR L'IMMIGRÉ.";
		// Hide "Oui" and "Non" buttons
		popupButtons.style.display = "none";
		// Show the "Continuer ->" button
		popupContinue.style.display = "inline-block";
	};

	// Event listeners for "Oui" and "Non" buttons
	popupYes.addEventListener("click", handlePopupChoice);
	popupNo.addEventListener("click", handlePopupChoice);

	// Handle "Continuer ->" button
	popupContinue.addEventListener("click", () => {
		popup.style.display = "none"; // Close popup
		characterSelection.style.display = "none"; // Hide character selection
	});

	// Show Combat Screen
	popupContinue.addEventListener("click", () => {
		popup.style.display = "none"; // Close the popup
		characterSelection.style.display = "none"; // Hide character selection
		combatScreen.style.display = "flex"; // Show combat screen
	});

	// Show the attack container and tutorial popup, hide combat-dialogue
	combatContinueBtn.addEventListener("click", () => {
		combatDialogue.style.display = "none"; // Hide the combat dialogue
		attackContainer.style.display = "block"; // Show the attack list
		tutorialPopup.style.display = "flex"; // Show the tutorial popup
	});

	// Close the tutorial popup
	startAttackBtn.addEventListener("click", () => {
		tutorialPopup.style.display = "none";
	});

	// Show the attack container and tutorial popup, hide combat-dialogue
	combatContinueBtn.addEventListener("click", () => {
		combatDialogue.style.display = "none"; // Hide the combat dialogue
		attackContainer.style.display = "flex"; // Ensure attack container is shown
		tutorialPopup.style.display = "flex"; // Show the tutorial popup
	});

	// Close the tutorial popup
	startAttackBtn.addEventListener("click", () => {
		tutorialPopup.style.display = "none";
	});

	// Screen Shake Effect
	const screenShake = (type) => {
		combatScreen.classList.add(type);
		setTimeout(() => combatScreen.classList.remove(type), 500);
	};

	// Function: Boss Attack
	const bossAttack = async () => {
		if (bossSkipTurnsLeft > 0) {
			await showCombatPopup(`Le boss est confus et passe son tour.`);
			bossSkipTurnsLeft--; // Decrement the counter
			return;
		}

		const bossAttacks = [
			{ name: "Contrôle", damage: 5 },
			{ name: "Mur", damage: 10 },
			{ name: "Chien", damage: 10 },
			{ name: "Douane", damage: 5 },
		];
		const attack = bossAttacks[Math.floor(Math.random() * bossAttacks.length)];
		playerHealth -= attack.damage;
		playerHealth = Math.max(0, playerHealth);
		playerHealthDisplay.textContent = `${playerHealth}/100`;

		await showCombatPopup(
			`Le boss utilise ${attack.name}. Tu perds ${attack.damage} PV.`
		);

		if (playerHealth === 0) {
			await showCombatPopup("Tu as perdu !");
		}
	};

	// Player Attack Logic
	attacks.forEach((attack) => {
		const attackName = attack.querySelector(".attack-name").textContent;
		const damage = parseInt(attack.dataset.damage, 10) || 0;
		const delay = parseInt(attack.dataset.delay, 10) || 0;
		const isCharge = attack.dataset.charge === "true";
		const effect = attack.dataset.effect; // Effect type (e.g., confusion)

		attackCooldowns[attackName] = 0;

		attack.addEventListener("click", async () => {
			if (effect === "confusion") {
				bossSkipTurnsLeft = 1; // Boss skips the current and next turn
				await showCombatPopup(`${attackName} utilisé ! Le boss est confus.`);
				attackCooldowns[attackName] = 3; // Apply cooldown for "Faux papiers"
				updateAttackUI();

				setTimeout(() => {
					reduceCooldowns(); // Reduce player attack cooldowns
					updateCooldowns();
				}, 1000);
				return;
			}

			if (attackCooldowns[attackName] > 0) {
				await showCombatPopup(
					`${attackName} est en délai pour ${attackCooldowns[attackName]} tours.`
				);
				return;
			}

			if (chargeInProgress) {
				if (chargeInProgress === attackName) {
					await showCombatPopup(`${attackName} est prêt !`);
					bossHealth -= damage;
					bossHealth = Math.max(0, bossHealth);
					bossHealthDisplay.textContent = `${bossHealth}/500`;
					checkBossHealth(); // Call the function here

					await showCombatPopup(
						`Attaque ${attackName} réussie : ${damage} dégâts infligés au boss !`
					);
					chargeInProgress = null;

					if (bossHealth === 0) {
						checkBossHealth();
						return;
					}

					setTimeout(() => {
						bossAttack();
						reduceCooldowns();
					}, 1000);
				} else {
					await showCombatPopup(
						`Tu es en train de charger ${chargeInProgress}. Termine ce tour avant.`
					);
				}
				return;
			}

			if (isCharge) {
				if (chargeInProgress) {
					await showCombatPopup(`Une autre attaque est en cours de charge.`);
					return;
				}

				await showCombatPopup(
					`${attackName} est en cours de charge. Il sera prêt au prochain tour.`
				);
				chargeInProgress = { name: attackName, damage: damage };

				// Proceed to boss attack
				setTimeout(() => {
					bossAttack();
					reduceCooldowns();

					// Execute the charged attack after 1 turn
					setTimeout(async () => {
						if (chargeInProgress && chargeInProgress.name === attackName) {
							await executeChargedAttack(attackName, damage);
							chargeInProgress = null; // Clear charge state
						}
					}, 1000);
				}, 1000);
				return;
			}

			bossHealth -= damage;
			bossHealth = Math.max(0, bossHealth);
			bossHealthDisplay.textContent = `${bossHealth}/500`;

			await showCombatPopup(
				`Attaque ${attackName} réussie : ${damage} dégâts infligés au boss !`
			);

			attackCooldowns[attackName] = delay;

			if (bossHealth === 0) {
				checkBossHealth();
				return;
			}

			setTimeout(async () => {
				await bossAttack();
				reduceCooldowns();
			}, 1000);
		});
	});

	// Store original attack descriptions
	const originalDescriptions = {};
	attacks.forEach((attack) => {
		const attackName = attack.querySelector(".attack-name").textContent;
		const attackDetails = attack.querySelector(".attack-details").innerHTML; // Use innerHTML to store <br> tags
		originalDescriptions[attackName] = attackDetails;
	});

	// Function: Update Cooldowns
	const updateCooldowns = () => {
		attacks.forEach((attack) => {
			const attackName = attack.querySelector(".attack-name").textContent;
			const cooldown = attackCooldowns[attackName];

			const attackDetails = attack.querySelector(".attack-details");
			if (cooldown > 0) {
				attack.classList.add("cooldown");
				attackDetails.innerHTML = `En délai : ${cooldown} tours`;
			} else {
				attack.classList.remove("cooldown");
				attackDetails.innerHTML = originalDescriptions[attackName]; // Restore original details
			}
		});
	};

	const executeChargedAttack = async (attackName, damage) => {
		if (!chargeInProgress || chargeInProgress.name !== attackName) return;

		await showCombatPopup(`${attackName} est prêt !`);
		bossHealth -= damage;
		bossHealth = Math.max(0, bossHealth);
		bossHealthDisplay.textContent = `${bossHealth}/500`;

		await showCombatPopup(
			`Attaque ${attackName} réussie : ${damage} dégâts infligés au boss !`
		);

		chargeInProgress = null; // Clear charge state
	};

	// Function: Reduce Cooldowns
	const reduceCooldowns = () => {
		for (const attackName in attackCooldowns) {
			if (attackCooldowns[attackName] > 0) {
				attackCooldowns[attackName]--;
			}
		}
		updateCooldowns();
	};

	// Start Combat
	startAttackBtn.addEventListener("click", () => {
		tutorialPopup.style.display = "none";
		attackContainer.style.display = "block";
	});

	// Interval to decrement cooldowns and charges
	setInterval(() => {
		decrementCooldownsAndCharges();
	}, 1000); // Update every second

	const showCombatPopup = (message) => {
		return new Promise((resolve) => {
			combatPopupText.textContent = message; // Set the popup message
			combatPopup.style.display = "flex"; // Show the popup

			combatPopupClose.onclick = () => {
				combatPopup.style.display = "none"; // Hide the popup
				resolve(); // Resolve the promise when "OK" is clicked
			};
		});
	};

	combatPopupClose.addEventListener("click", () => {
		combatPopup.style.display = "none"; // Hide the popup
	});

	// Function to display the victory popup when the boss "Frontière" is defeated
	const showVictoryPopup = async () => {
		// Create a popup dynamically
		const victoryPopup = document.createElement("div");
		victoryPopup.id = "victory-popup";
		victoryPopup.style.position = "absolute";
		victoryPopup.style.top = "50%";
		victoryPopup.style.left = "50%";
		victoryPopup.style.transform = "translate(-50%, -50%)";
		victoryPopup.style.backgroundColor = "black";
		victoryPopup.style.color = "white";
		victoryPopup.style.padding = "20px";
		victoryPopup.style.borderRadius = "8px";
		victoryPopup.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
		victoryPopup.style.textAlign = "center";
		victoryPopup.style.zIndex = "1000";

		// Add the congratulatory message
		victoryPopup.innerHTML = `
        <p>Félicitations mon bébé ! Tu as battu ton premier adversaire.</p>
        <p>Vu que c'est le premier, j'ai trois choses à t'offrir.</p>
        <button id="victory-continue" style="margin-top: 10px; background-color: #ffffff; color: black; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">Continuer -></button>
    `;

		// Append the popup to the body
		document.body.appendChild(victoryPopup);

		// Add an event listener to the continue button
		const continueButton = document.getElementById("victory-continue");
		continueButton.addEventListener("click", () => {
			victoryPopup.style.display = "none";
			// Logic to transition to the next part of the game
			// Example: load the next combat or show a reward screen
			loadNextStage();
		});
	};

	// Function to check if the boss "Frontière" is defeated
	const checkBossHealth = () => {
		console.log("Checking boss health:", bossHealth);
		if (bossHealth <= 0) {
			showVictoryPopup();
		}
	};

	// Call checkBossHealth in your player attack logic after bossHealth updates:
	// Example:
	// bossHealth -= damage;
	// checkBossHealth();

	// Placeholder function for transitioning to the next stage
	const loadNextStage = () => {
		console.log("Transitioning to the next stage...");
		// Add your game logic here
	};
});
