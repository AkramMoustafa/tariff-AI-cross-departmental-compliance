from fastapi import APIRouter

from src.api.Commodities.ai import load_macro_dataset, predict_trend, calculate_macro_risks

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/predict")
def predict(feature: str = "BRENT", weeks: int = 3):

    df = load_macro_dataset()

    result = predict_trend(
        df,
        target_feature=feature,
        weeks_ahead=weeks
    )

    return {
        "feature": feature,
        "prediction": result
    }

@router.get("/macro-risks")
def macro_risks():

    df = load_macro_dataset()

    risks = calculate_macro_risks(df)

    return risks