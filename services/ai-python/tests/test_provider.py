import pytest

from app.providers.disabled import DisabledProvider


@pytest.mark.asyncio
async def test_disabled_provider_is_deterministic_and_safe() -> None:
    provider = DisabledProvider()
    first = await provider.process("plan", {"symptoms": "ignored"})
    second = await provider.process("anything", {})

    assert first == second
    assert first.enabled is False
    assert first.data is None
    assert "no medical advice" in first.message
