// Global Log Function to display results in the HTML
const log = (message, isError = false) => {
    const logElement = document.getElementById('log');
    const span = document.createElement('span');
    // Using innerHTML to allow simple formatting like line breaks
    span.innerHTML = message + '<br>'; 
    span.className = isError ? 'step-failure' : 'step-success';
    logElement.appendChild(span);
    // Auto-scroll to the bottom
    logElement.scrollTop = logElement.scrollHeight;
};

// --- 📦 The Maybe Monad Class 📦 ---
class Maybe {
    /**
     * A simple Monad container (or box) that holds a value or null (Failure).
     * The Monad Architecture (Driver) wraps the internal State (Value).
     */
    constructor(value) {
        this._value = value;
    }

    // 1. UNIT/RETURN: Lifts a normal value into the Monad Box.
    static unit(value) {
        return new Maybe(value);
    }

    // 2. BIND (flatMap): The core chaining operation.
    // It runs the next function ONLY if the current value is present.
    bind(func) {
        if (this._value === null || this._value === undefined) {
            // ❌ Failure Path (Snake): Return the current failure box, 
            // skipping all subsequent bind calls.
            return this; 
        }
        
        // ✅ Success Path (Ladder): Pass the value to the next function.
        // The next function 'func' MUST also return a Monad Box.
        return func(this._value);
    }

    // A helper to retrieve the final result
    getValue() {
        return this._value;
    }
}

// --- 🪜 Architecture Steps (Monadic Functions) 🐍 ---

/**
 * Corresponds to Step 1: Driver calls Impl Executor (State Update Request).
 * @param {number} data The current state value.
 * @returns {Maybe} A new Monad box, either with the next state or a null/failure.
 */
const step1_call_executor = (data) => {
    log(`🔄 Step 1 (CALL Executor): Input State is ${data}. Checking for valid command...`);
    
    // Failure Condition: If the state is too small (<= 20), the command is invalid.
    if (data <= 20) {
        log(`❌ Step 1 FAILURE: State value <= 20. Execution stopped! (Snake!)`, true);
        return Maybe.unit(null); // Return Monad Failure
    } 
    
    const nextValue = data + 10;
    log(`✅ Step 1 SUCCESS: Command accepted. Next State: ${nextValue}`);
    return Maybe.unit(nextValue); // Return Monad Success
};

/**
 * Corresponds to Step 2: Executor Updates State and calls PersistenceLogger.
 * This simulates the internal work and side-effect requests.
 * @param {number} data The state value from the previous step.
 * @returns {Maybe} 
 */
const step2_update_state = (data) => {
    log(`🔄 Step 2 (UPDATE/PERSIST): Input State is ${data}. Checking state integrity...`);

    // Failure Condition: If the state is odd, there's an integrity error.
    if (data % 2 !== 0) {
        log(`❌ Step 2 FAILURE: State is Odd. Integrity Error! (Snake!)`, true);
        return Maybe.unit(null); // Return Monad Failure
    } 
    
    const nextValue = data / 2;
    log(`✅ Step 2 SUCCESS: State updated and persisted. Next State: ${nextValue}`);
    return Maybe.unit(nextValue);
};

/**
 * Corresponds to Step 3: Executor Returns Event to Driver.
 * @param {number} data The final state value.
 * @returns {Maybe} 
 */
const step3_return_event = (data) => {
    log(`🔄 Step 3 (RETURN EVENT): Final successful step. Input is ${data}.`);
    
    const finalValue = data * 3;
    log(`✅ Step 3 SUCCESS: Final Event data is computed: ${finalValue}`);
    return Maybe.unit(finalValue);
};

// --- 🚀 Game Loop / The Monad Chain 🚀 ---

const startGame = () => {
    const initialValueInput = document.getElementById('initialValue').value;
    const initialValue = parseInt(initialValueInput, 10);
    const finalValueElement = document.getElementById('finalValue');
    
    // Clear the log for a new run
    document.getElementById('log').innerHTML = ''; 
    finalValueElement.textContent = '?';
    
    if (isNaN(initialValue)) {
        log("Please enter a valid number.", true);
        return;
    }
    
    log(`\n--- 🚀 Starting Chain with Initial Value: ${initialValue} 🚀 ---`);

    // The Monad Chain: Functions are linked using 'bind'.
    // This sequence mirrors the 1 -> 2 -> 3 flow in your architecture diagram.
    const finalMonad = Maybe.unit(initialValue) 
        .bind(step1_call_executor) 
        .bind(step2_update_state) 
        .bind(step3_return_event);

    // Get the final result from the Monad Box
    const finalResult = finalMonad.getValue();

    // Display the final result
    if (finalResult !== null && finalResult !== undefined) {
        log(`\n🎉 Chain Complete! Final Monad Value: ${finalResult}`, false);
        finalValueElement.textContent = finalResult;
    } else {
        log(`\n🛑 Chain Halted! Final Monad Value: NULL. (A step failed and stopped the entire process).`, true);
        finalValueElement.textContent = "FAILURE (NULL)";
    }
};
